const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber } = req.body;

    // Check if password exists
    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Log to help with debugging
    console.log("Registration data received:", {
      firstName,
      lastName,
      email,
      passwordReceived: !!password, // Just log if it exists, not the actual password
      contactNumber,
    });

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, "user"),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isPremium: user.isPremium,
        token: generateToken(user._id, "user"),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Other controller functions with basic implementations
const getUserProfile = async (req, res) => {
  try {
    // Add this check to prevent the error
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.contactNumber = req.body.contactNumber || user.contactNumber;
    user.schoolOrganizationName =
      req.body.schoolOrganizationName || user.schoolOrganizationName;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.skills = req.body.skills || user.skills;

    // Update nested fields properly
    if (req.body.education) {
      user.education = {
        level: req.body.education.level || user.education?.level,
        institution:
          req.body.education.institution || user.education?.institution,
        year: req.body.education.year || user.education?.year,
      };
    }

    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        city: req.body.address.city || user.address?.city,
        state: req.body.address.state || user.address?.state,
        country: req.body.address.country || user.address?.country,
        pincode: req.body.address.pincode || user.address?.pincode,
      };
    }

    if (req.body.belowPoverty) {
      user.belowPoverty = {
        status: req.body.belowPoverty.status,
        document: req.body.belowPoverty.document || user.belowPoverty?.document,
        verified: user.belowPoverty?.verified || false,
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      contactNumber: updatedUser.contactNumber,
      schoolOrganizationName: updatedUser.schoolOrganizationName,
      education: updatedUser.education,
      address: updatedUser.address,
      streak: updatedUser.streak,
      skills: updatedUser.skills,
      profileImage: updatedUser.profileImage,
      isPremium: updatedUser.isPremium,
      belowPoverty: updatedUser.belowPoverty,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  // Implementation for getting all users (admin only)
  res.json({ message: "Get all users endpoint" });
};

const getUserById = async (req, res) => {
  // Implementation for getting user by ID
  res.json({ message: "Get user by ID endpoint" });
};

const deleteUser = async (req, res) => {
  // Implementation for deleting a user (admin only)
  res.json({ message: "Delete user endpoint" });
};

const updateBelowPovertyStatus = async (req, res) => {
  // Implementation for updating below poverty status
  res.json({ message: "Update below poverty status endpoint" });
};

const getUserNotebooks = async (req, res) => {
  // Implementation for getting user notebooks
  res.json({ message: "Get user notebooks endpoint" });
};

const getUserCourses = async (req, res) => {
  // Implementation for getting user courses
  res.json({ message: "Get user courses endpoint" });
};

const getUserCompetitions = async (req, res) => {
  // Implementation for getting user competitions
  res.json({ message: "Get user competitions endpoint" });
};

const getUserMocktestResults = async (req, res) => {
  // Implementation for getting user mocktest results
  res.json({ message: "Get user mocktest results endpoint" });
};

const updateUserAttendance = async (req, res) => {
  // Implementation for updating user attendance
  res.json({ message: "Update user attendance endpoint" });
};

const getUserBadges = async (req, res) => {
  // Implementation for getting user badges
  res.json({ message: "Get user badges endpoint" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  updateBelowPovertyStatus,
  getUserNotebooks,
  getUserCourses,
  getUserCompetitions,
  getUserMocktestResults,
  updateUserAttendance,
  getUserBadges,
};
