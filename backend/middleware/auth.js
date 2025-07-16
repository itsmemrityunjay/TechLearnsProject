const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Mentor = require("../models/mentorModel");
const School = require("../models/schoolModel");

// Helper function to wait for database connection
const waitForConnection = async (maxRetries = 5) => {
  let retries = 0;
  while (mongoose.connection.readyState !== 1 && retries < maxRetries) {
    console.log(`Waiting for database connection... (attempt ${retries + 1})`);
    await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)));
    retries++;
  }

  if (mongoose.connection.readyState !== 1) {
    throw new Error(`Database connection not ready after ${maxRetries} attempts`);
  }

  return true;
};

// Generate token for authentication
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Protect routes middleware
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded:", decoded);

      // Wait for database connection before querying
      await waitForConnection();

      if (decoded.role === "user") {
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
          throw new Error("User not found");
        }
      } else if (decoded.role === "mentor") {
        req.mentor = await Mentor.findById(decoded.id).select("-password");
        if (!req.mentor) {
          throw new Error("Mentor not found");
        }
      } else if (decoded.role === "school") {
        req.school = await School.findById(decoded.id).select("-password");
        if (!req.school) {
          throw new Error("School not found");
        }
      }

      req.userId = decoded.id;
      req.userRole = decoded.role;

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } catch (error) {
    console.error("Protect middleware error:", error);
    res.status(500).json({ message: "Server error in authentication" });
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
