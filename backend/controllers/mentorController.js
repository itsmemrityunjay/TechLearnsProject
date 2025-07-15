const mongoose = require("mongoose");
const Mentor = require("../models/mentorModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const Class = require("../models/classModel");
const Notification = require("../models/notificationModel.js");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");

// @desc    Register a new mentor
// @route   POST /api/mentors/register
// @access  Public
const registerMentor = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber } = req.body;

    // Check if mentor already exists
    const mentorExists = await Mentor.findOne({ email });
    if (mentorExists) {
      return res.status(400).json({ message: "Mentor already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create mentor
    const mentor = await Mentor.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contactNumber,
    });

    if (mentor) {
      res.status(201).json({
        _id: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email,
        token: generateToken(mentor._id, "mentor"),
      });
    } else {
      res.status(400).json({ message: "Invalid mentor data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth mentor & get token
// @route   POST /api/mentors/login
// @access  Public
const loginMentor = async (req, res) => {
  let retryCount = 0;
  const MAX_RETRIES = 3;
  
  const attemptLogin = async () => {
    try {
      console.log("👉 Mentor login attempt for:", req.body.email);
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("❌ Missing email or password");
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Database connected - proceed with authentication
      console.log("🔍 Searching for mentor with email:", email);
      
      let mentor = null;
      let retries = 0;
      
      // Add retry logic around the database query
      while (!mentor && retries < 3) {
        try {
          // Check MongoDB connection state
          if (mongoose.connection.readyState !== 1) {
            console.log(`⚠️ Database not connected (state: ${mongoose.connection.readyState}). Attempt ${retries + 1}`);
            
            // Wait a moment before retrying
            await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
            retries++;
            continue;
          }
          
          // Try to find the mentor
          mentor = await Mentor.findOne({ email });
        } catch (dbError) {
          console.log(`⚠️ Database error on attempt ${retries + 1}:`, dbError.message);
          
          if (retries >= 2 || !dbError.message.includes('bufferCommands')) {
            throw dbError; // Re-throw if not a connection error or we're out of retries
          }
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries)));
          retries++;
        }
      }

      if (!mentor) {
        console.log("❌ No mentor found with email:", email);
        
        // In development, provide more helpful error message
        if (process.env.NODE_ENV === 'development') {
          try {
            // Only attempt this if we have a connection
            if (mongoose.connection.readyState === 1) {
              const allMentors = await Mentor.find({}, 'email');
              console.log("Available mentor emails:", allMentors.map(m => m.email));
            }
          } catch (err) {
            console.log("Could not fetch mentor emails:", err.message);
          }
          
          return res.status(401).json({ 
            message: "Invalid email or password",
            debug: "No mentor found with this email"
          });
        }
        
        return res.status(401).json({ message: "Invalid email or password" });
      }

      console.log("✅ Mentor found:", mentor._id);
      console.log("📋 Password hash exists:", !!mentor.password);
      console.log("📋 Password hash length:", mentor.password?.length || 0);
      
      // Check if password matches
      console.log("🔐 Comparing password with hash");
      const isMatch = await bcrypt.compare(password, mentor.password);
      console.log("🔑 Password match result:", isMatch);

      if (isMatch) {
        console.log("✅ Password matched, generating token");
        const token = generateToken(mentor._id, "mentor");
        
        return res.json({
          _id: mentor._id,
          firstName: mentor.firstName,
          lastName: mentor.lastName,
          email: mentor.email,
          status: mentor.status || 'active',
          token
        });
      } else {
        console.log("❌ Password mismatch for:", email);
        
        // In development, provide slightly more information
        if (process.env.NODE_ENV === 'development') {
          return res.status(401).json({ 
            message: "Invalid email or password",
            debug: "Password did not match stored hash"
          });
        }
        
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("❌ Mentor login error:", error);
      return res.status(500).json({ 
        message: "Server error", 
        error: error.message 
      });
    }
  };
  
  // Start the login attempt
  return attemptLogin();
};

// @desc    Get mentor profile
// @route   GET /api/mentors/profile
// @access  Private (Mentor only)
const getMentorProfile = async (req, res) => {
  try {
    // The mentor object should already be available from mentorOnly middleware
    const mentor = await Mentor.findById(req.mentor._id)
      .select("-password")
      .populate("courses"); // Remove the reviews.user populate

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor);
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/profile
// @access  Private (Mentor only)
const updateMentorProfile = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    // Find the mentor
    const mentor = await Mentor.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Update fields
    mentor.name = req.body.firstName || mentor.firstName;
    mentor.lastName = req.body.lastName || mentor.lastName;
    mentor.email = req.body.email || mentor.email;
    mentor.contactNumber = req.body.contactNumber || mentor.contactNumber;
    mentor.bio = req.body.bio || mentor.bio;
    mentor.qualifications = req.body.qualifications || mentor.qualifications;
    mentor.experience = req.body.experience || mentor.experience;
    mentor.profileImage = req.body.profileImage || mentor.profileImage;

    // Update skills if provided
    if (req.body.skills) {
      mentor.skills = req.body.skills;
    }

    // Update social links if provided
    if (req.body.socialLinks) {
      mentor.socialLinks = {
        ...mentor.socialLinks,
        ...req.body.socialLinks,
      };
    }

    // Save updated mentor
    const updatedMentor = await mentor.save();

    // Return the updated mentor without password
    res.json({
      _id: updatedMentor._id,
      firstName: updatedMentor.firstName,
      firstName: updatedMentor.firstName,
      email: updatedMentor.email,
      contactNumber: updatedMentor.contactNumber,
      bio: updatedMentor.bio,
      skills: updatedMentor.skills,
      qualifications: updatedMentor.qualifications,
      experience: updatedMentor.experience,
      profileImage: updatedMentor.profileImage,
      socialLinks: updatedMentor.socialLinks,
      status: updatedMentor.status,
      averageRating: updatedMentor.averageRating,
    });
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ status: "active" }).select("-password");
    res.json(mentors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMentorById = async (req, res) => {
  try {
    const mentorId = req.params.id;
    
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ message: "Invalid mentor ID format" });
    }
    
    // Find mentor by ID and exclude password
    const mentor = await Mentor.findById(mentorId)
      .select("-password")
      .populate("courses");
    
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    
    // Return mentor data
    res.json(mentor);
  } catch (error) {
    console.error("Error fetching mentor by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteMentor = async (req, res) => {
  // Implementation for deleting a mentor (admin only)
  res.json({ message: "Delete mentor endpoint" });
};

const updateMentorAvailability = async (req, res) => {
  // Implementation for updating mentor availability
  res.json({ message: "Update mentor availability endpoint" });
};

// @desc    Get courses created by mentor
// @route   GET /api/mentors/courses
// @access  Private (Mentor only)
const getMentorCourses = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    const courses = await Course.find({ createdBy: mentorId });

    res.json(courses);
  } catch (error) {
    console.error("Error fetching mentor courses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMentorTopics = async (req, res) => {
  // Implementation for getting mentor topics
  res.json({ message: "Get mentor topics endpoint" });
};

const getMentorCompetitions = async (req, res) => {
  // Implementation for getting mentor competitions
  res.json({ message: "Get mentor competitions endpoint" });
};

const getMentorReviews = async (req, res) => {
  // Implementation for getting mentor reviews
  res.json({ message: "Get mentor reviews endpoint" });
};

const addMentorReview = async (req, res) => {
  // Implementation for adding mentor review
  res.json({ message: "Add mentor review endpoint" });
};

// @desc    Get students enrolled in mentor's courses
// @route   GET /api/mentors/students
// @access  Private (Mentor only)
const getMentorStudents = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    // Find all courses created by this mentor
    const courses = await Course.find({ createdBy: mentorId });
    const courseIds = courses.map((course) => course._id);

    // Find users enrolled in these courses
    const students = await User.find({
      enrolledCourses: { $in: courseIds },
    }).select("-password");

    res.json(students);
  } catch (error) {
    console.error("Error fetching mentor students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get classes scheduled by this mentor
// @route   GET /api/mentors/classes
// @access  Private (Mentor only)
const getMentorClasses = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    // Find all classes by this mentor
    const classes = await Class.find({ mentor: mentorId })
      .populate("course", "title")
      .sort({ startTime: 1 });

    res.json(classes);
  } catch (error) {
    console.error("Error fetching mentor classes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get notifications for this mentor
// @route   GET /api/mentors/notifications
// @access  Private (Mentor only)
const getMentorNotifications = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    const notifications = await Notification.find({
      recipient: mentorId,
      recipientType: "mentor",
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching mentor notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reset mentor password (development tool)
// @route   POST /api/mentors/reset-password
// @access  Public (for development purposes)
const resetMentorPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    
    // Find the mentor
    const mentor = await Mentor.findOne({ email });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    
    // Log current password hash for debugging
    console.log(`🔄 Resetting password for mentor: ${email}`);
    console.log(`📋 Current password hash: ${mentor.password?.substring(0, 10)}...`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    mentor.password = hashedPassword;
    await mentor.save();
    
    console.log(`✅ Password reset successful, new hash: ${hashedPassword.substring(0, 10)}...`);
    
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Password reset error:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
  registerMentor,
  loginMentor,
  getMentorProfile,
  updateMentorProfile,
  getAllMentors,
  getMentorById,
  deleteMentor,
  updateMentorAvailability,
  getMentorCourses,
  getMentorTopics,
  getMentorCompetitions,
  getMentorReviews,
  addMentorReview,
  getMentorStudents,
  getMentorClasses,
  getMentorNotifications,
  resetMentorPassword, // Add this new function
};
