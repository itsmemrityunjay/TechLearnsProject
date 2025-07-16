const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Mentor = require("../models/mentorModel");
const School = require("../models/schoolModel");

// Generate token for authentication
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Protect routes - verify token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set user ID and role on request
      req.userId = decoded.id;
      req.role = decoded.role;

      // Add more debugging if needed
      console.log("Token decoded:", { id: decoded.id, role: decoded.role });

      // Fetch and attach appropriate user data based on role
      if (decoded.role === "user") {
        req.user = await User.findById(decoded.id).select("-password");
      } else if (decoded.role === "mentor") {
        req.mentor = await Mentor.findById(decoded.id).select("-password");
      } else if (decoded.role === "school") {
        req.school = await School.findById(decoded.id).select("-password");
      }

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin only middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

// Mentor only middleware
const mentorOnly = async (req, res, next) => {
  try {
    // Check if we have user ID from auth token
    if (!req.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // If role from token is mentor, we're good
    if (req.role === "mentor") {
      // Find the mentor to attach to request
      const mentor = await Mentor.findById(req.userId).select("-password");
      if (!mentor) {
        return res.status(404).json({ message: "Mentor account not found" });
      }

      req.mentor = mentor;
      return next();
    }

    // Not a mentor
    return res.status(403).json({ message: "Mentor access required" });
  } catch (error) {
    console.error("Mentor middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// School only middleware
const schoolOnly = (req, res, next) => {
  if (req.role === "school") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a school" });
  }
};

// Premium or registered user middleware
const premiumOrRegistered = (req, res, next) => {
  if (
    (req.role === "user" && req.user.isPremium) ||
    (req.role === "user" && req.user.registeredCourses.length > 0)
  ) {
    next();
  } else {
    res.status(403).json({
      message: "Access denied. Premium or course registration required.",
    });
  }
};

module.exports = {
  generateToken,
  protect,
  admin,
  mentorOnly,
  schoolOnly,
  premiumOrRegistered,
};
