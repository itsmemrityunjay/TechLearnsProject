const User = require("../models/userModel");
const Mentor = require("../models/mentorModel"); // Import Mentor model
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
    console.log("Login attempt for:", req.body.email);
    
    // Check if required fields are provided
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Log the request body (excluding password)
    console.log("Login request data:", { 
      email, 
      passwordProvided: !!password 
    });
    
    // Find user by email - adding a try/catch specifically for database operations
    let user;
    try {
      console.log("Searching for user with email:", email);
      user = await User.findOne({ email });
      console.log("Database query completed");
    } catch (dbError) {
      console.error("Database error during user lookup:", dbError);
      return res.status(500).json({ 
        message: "Unable to access user database", 
        error: dbError.message 
      });
    }
    
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    console.log("User found, checking password");
    
    // Validate password format before comparing
    if (!user.password) {
      console.error("User has no password hash stored:", user._id);
      return res.status(500).json({ message: "Account configuration error" });
    }
    
    // Check password match with additional error handling
    let isMatch;
    try {
      console.log("Comparing passwords using bcrypt");
      isMatch = await bcrypt.compare(password, user.password);
      console.log("Password comparison completed");
    } catch (bcryptError) {
      console.error("bcrypt error during password comparison:", bcryptError);
      return res.status(500).json({ 
        message: "Error verifying password", 
        error: bcryptError.message 
      });
    }
    
    if (isMatch) {
      console.log("Password match, generating token for user:", user._id);
      
      // Generate token with enhanced error handling
      let token;
      try {
        token = generateToken(user._id, "user");
        console.log("Token generated successfully");
      } catch (tokenError) {
        console.error("Token generation failed:", tokenError);
        console.error("JWT_SECRET available:", !!process.env.JWT_SECRET);
        return res.status(500).json({ 
          message: "Authentication error", 
          error: tokenError.message 
        });
      }
      
      // Send response
      console.log("Sending successful login response");
      return res.status(200).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isPremium: user.isPremium,
        token
      });
    } else {
      console.log("Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error details:", error);
    console.error("Error stack:", error.stack);
    
    // Provide more specific error messages based on error type
    if (error.name === 'MongoError' || error.name === 'MongooseError' || error.name === 'MongoServerError') {
      return res.status(500).json({ message: "Database connection error" });
    } else if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Invalid data format" });
    } else if (error.name === 'SyntaxError') {
      return res.status(400).json({ message: "Invalid request format" });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(500).json({ message: "Token generation error" });
    } else if (error.name === 'BcryptError' || error.code === 'BCRYPT_ERROR') {
      return res.status(500).json({ message: "Password verification error" });
    }
    
    return res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
};

// @desc    Register a new mentor
// @route   POST /api/users/register-mentor
// @access  Public
const registerMentor = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber, skills } = req.body;
    
    // Check if mentor already exists
    const mentorExists = await Mentor.findOne({ email });
    if (mentorExists) {
      return res.status(400).json({ message: "Mentor already exists" });
    }
    
    // Ensure password is properly hashed with sufficient rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log("Creating new mentor account for:", email);
    
    // Create mentor
    const mentor = await Mentor.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,  // Store the hashed password
      contactNumber,
      skills: Array.isArray(skills) ? skills : []
    });
    
    if (mentor) {
      console.log("Mentor created successfully:", mentor._id);
      res.status(201).json({
        _id: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email,
        token: generateToken(mentor._id, "mentor")
      });
    } else {
      res.status(400).json({ message: "Invalid mentor data" });
    }
  } catch (error) {
    console.error("Mentor registration error:", error);
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
  try {
    const user = await User.findById(req.user._id).populate({
      path: "mocktestResults.testId",
      select: "title description courseId",
      populate: {
        path: "courseId",
        select: "title"
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const results = user.mocktestResults.map(result => ({
      _id: result._id,
      testId: result.testId,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      passed: result.passed,
      takenAt: result.takenAt,
      testTitle: result.testId?.title || 'Unknown Test',
      courseTitle: result.testId?.courseId?.title || 'General'
    }));

    res.json({
      success: true,
      results: results.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))
    });
  } catch (error) {
    console.error("Error fetching user mock test results:", error);
    res.status(500).json({ message: "Server error" });
  }
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
  registerMentor, // Export registerMentor function
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
