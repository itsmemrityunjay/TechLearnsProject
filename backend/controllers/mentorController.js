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
  try {
    const { email, password } = req.body;

    // Find mentor by email
    const mentor = await Mentor.findOne({ email });

    // Check if mentor exists and password matches
    if (mentor && (await bcrypt.compare(password, mentor.password))) {
      res.json({
        _id: mentor._id,
        firstName: mentor.firstName,
        lastName: mentor.lastName,
        email: mentor.email,
        status: mentor.status,
        token: generateToken(mentor._id, "mentor"), // Note the "mentor" role
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
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
  // Implementation for getting mentor by ID
  res.json({ message: "Get mentor by ID endpoint" });
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
};
