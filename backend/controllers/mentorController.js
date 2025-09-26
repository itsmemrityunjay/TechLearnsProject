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

    // Create mentor with plain password (let model handle hashing)
    const mentor = await Mentor.create({
      firstName,
      lastName,
      email,
      password, // Plain text - will be hashed by pre-save hook
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
        return res
          .status(400)
          .json({ message: "Email and password are required" });
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
            console.log(
              `⚠️ Database not connected (state: ${
                mongoose.connection.readyState
              }). Attempt ${retries + 1}`
            );

            // Wait a moment before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, 500 * Math.pow(2, retries))
            );
            retries++;
            continue;
          }

          // Try to find the mentor
          mentor = await Mentor.findOne({ email });
        } catch (dbError) {
          console.log(
            `⚠️ Database error on attempt ${retries + 1}:`,
            dbError.message
          );

          if (retries >= 2 || !dbError.message.includes("bufferCommands")) {
            throw dbError; // Re-throw if not a connection error or we're out of retries
          }

          // Wait a moment before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, 500 * Math.pow(2, retries))
          );
          retries++;
        }
      }

      if (!mentor) {
        console.log("❌ No mentor found with email:", email);

        // In development, provide more helpful error message
        if (process.env.NODE_ENV === "development") {
          try {
            // Only attempt this if we have a connection
            if (mongoose.connection.readyState === 1) {
              const allMentors = await Mentor.find({}, "email");
              console.log(
                "Available mentor emails:",
                allMentors.map((m) => m.email)
              );
            }
          } catch (err) {
            console.log("Could not fetch mentor emails:", err.message);
          }

          return res.status(401).json({
            message: "Invalid email or password",
            debug: "No mentor found with this email",
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
          status: mentor.status || "active",
          token,
        });
      } else {
        console.log("❌ Password mismatch for:", email);

        // In development, provide slightly more information
        if (process.env.NODE_ENV === "development") {
          return res.status(401).json({
            message: "Invalid email or password",
            debug: "Password did not match stored hash",
          });
        }

        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error("❌ Mentor login error:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
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

// @desc    Get detailed student information
// @route   GET /api/mentors/students/:id
// @access  Private (Mentor only)
const getStudentDetails = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const studentId = req.params.id;

    // Find all courses created by this mentor
    const courses = await Course.find({ createdBy: mentorId });
    const courseIds = courses.map((course) => course._id);

    // Find the student and ensure they're enrolled in mentor's courses
    const student = await User.findOne({
      _id: studentId,
      enrolledCourses: { $in: courseIds },
    })
    .select("-password")
    .populate("enrolledCourses", "title category")
    .populate("mockTestResults.mockTestId", "title");

    if (!student) {
      return res.status(404).json({ message: "Student not found or not enrolled in your courses" });
    }

    // Get student's progress in mentor's courses
    const studentProgress = [];
    for (const course of courses) {
      if (student.enrolledCourses.some(enrolled => enrolled._id.equals(course._id))) {
        const progress = student.courseProgress.find(p => p.courseId.equals(course._id));
        studentProgress.push({
          course: course,
          progress: progress ? progress.progress : 0,
          completedTopics: progress ? progress.completedTopics : [],
          lastAccessed: progress ? progress.lastAccessed : null
        });
      }
    }

    // Get student's mock test results for mentor's tests
    const mockTests = await MockTest.find({ createdBy: mentorId });
    const studentTestResults = student.mockTestResults.filter(result => 
      mockTests.some(test => test._id.equals(result.mockTestId))
    );

    res.json({
      student,
      courseProgress: studentProgress,
      mockTestResults: studentTestResults
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Send message to student
// @route   POST /api/mentors/students/:id/message
// @access  Private (Mentor only)
const sendMessageToStudent = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const studentId = req.params.id;
    const { message, subject } = req.body;

    // Verify student is enrolled in mentor's courses
    const courses = await Course.find({ createdBy: mentorId });
    const courseIds = courses.map((course) => course._id);

    const student = await User.findOne({
      _id: studentId,
      enrolledCourses: { $in: courseIds },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found or not enrolled in your courses" });
    }

    // Create notification for student
    const notification = new Notification({
      recipient: studentId,
      recipientType: "user",
      title: subject || "Message from Mentor",
      message: message,
      type: "message",
      read: false,
      sender: mentorId,
      senderType: "mentor"
    });

    await notification.save();

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message to student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get student performance analytics
// @route   GET /api/mentors/students/analytics
// @access  Private (Mentor only)
const getStudentAnalytics = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    // Find all courses created by this mentor
    const courses = await Course.find({ createdBy: mentorId });
    const courseIds = courses.map((course) => course._id);

    // Find students enrolled in these courses
    const students = await User.find({
      enrolledCourses: { $in: courseIds },
    }).select("-password");

    // Calculate analytics
    const analytics = {
      totalStudents: students.length,
      activeStudents: 0,
      inactiveStudents: 0,
      averageProgress: 0,
      courseEnrollments: {},
      performanceDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0
      }
    };

    let totalProgress = 0;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const student of students) {
      // Check if student is active
      if (student.lastActive && new Date(student.lastActive) >= thirtyDaysAgo) {
        analytics.activeStudents++;
      } else {
        analytics.inactiveStudents++;
      }

      // Calculate average progress
      if (student.courseProgress && student.courseProgress.length > 0) {
        const studentAverage = student.courseProgress.reduce((sum, progress) => 
          sum + (progress.progress || 0), 0) / student.courseProgress.length;
        totalProgress += studentAverage;

        // Performance distribution
        if (studentAverage >= 90) analytics.performanceDistribution.excellent++;
        else if (studentAverage >= 70) analytics.performanceDistribution.good++;
        else if (studentAverage >= 50) analytics.performanceDistribution.average++;
        else analytics.performanceDistribution.poor++;
      }

      // Course enrollments
      for (const courseId of student.enrolledCourses) {
        const courseIdStr = courseId.toString();
        analytics.courseEnrollments[courseIdStr] = (analytics.courseEnrollments[courseIdStr] || 0) + 1;
      }
    }

    analytics.averageProgress = students.length > 0 ? totalProgress / students.length : 0;

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching student analytics:", error);
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

// @desc    Mark notification as read
// @route   PUT /api/mentors/notifications/:id/read
// @access  Private (Mentor only)
const markNotificationAsRead = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        recipient: mentorId, 
        recipientType: "mentor" 
      },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/mentors/notifications/mark-all-read
// @access  Private (Mentor only)
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    await Notification.updateMany(
      { 
        recipient: mentorId, 
        recipientType: "mentor",
        read: false 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete notification
// @route   DELETE /api/mentors/notifications/:id
// @access  Private (Mentor only)
const deleteNotification = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: mentorId,
      recipientType: "mentor"
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete all notifications
// @route   DELETE /api/mentors/notifications
// @access  Private (Mentor only)
const deleteAllNotifications = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    const result = await Notification.deleteMany({
      recipient: mentorId,
      recipientType: "mentor"
    });

    res.json({ 
      message: `Deleted ${result.deletedCount} notifications` 
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create notification for mentor
// @route   POST /api/mentors/notifications
// @access  Private (Mentor only)
const createNotification = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const { title, message, type } = req.body;

    const notification = new Notification({
      recipient: mentorId,
      recipientType: "mentor",
      title,
      message,
      type: type || "info",
      read: false
    });

    await notification.save();

    res.status(201).json({ 
      message: "Notification created", 
      notification 
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update mentor's course
// @route   PUT /api/mentors/courses/:courseId
// @access  Private (Mentor only)
const updateMentorCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const mentorId = req.mentor._id;

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author of the course
    if (!course.createdBy.equals(mentorId)) {
      return res.status(403).json({
        message: "Not authorized to update this course",
      });
    }

    const {
      title,
      description,
      category,
      courseFor,
      isPremium,
      price,
      thumbnail,
      objectives,
      content,
    } = req.body;

    // Update basic fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (courseFor) course.courseFor = courseFor;
    if (isPremium !== undefined) course.isPremium = isPremium;
    if (price !== undefined && isPremium) course.price = price;
    if (thumbnail) course.thumbnail = thumbnail;
    if (objectives && Array.isArray(objectives)) course.objectives = objectives;

    // Update content if provided
    if (content && Array.isArray(content)) {
      // Format content items to remove temporary IDs
      let formattedContent = content.map((item) => {
        // If item has a MongoDB ObjectId, keep it, otherwise remove the _id field
        if (item._id && mongoose.Types.ObjectId.isValid(item._id)) {
          return item;
        } else {
          const { _id, ...contentWithoutId } = item;
          return contentWithoutId;
        }
      });

      course.content = formattedContent;
    }

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating mentor course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete mentor's course
// @route   DELETE /api/mentors/courses/:courseId
// @access  Private (Mentor only)
const deleteMentorCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const mentorId = req.mentor._id;

    // Find the course
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author of the course
    if (!course.createdBy.equals(mentorId)) {
      return res.status(403).json({
        message: "Not authorized to delete this course",
      });
    }

    // Check if there are enrolled students
    if (course.totalEnrollments > 0) {
      return res.status(400).json({
        message:
          "Cannot delete course with enrolled students. Please contact support.",
      });
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    // Remove course from mentor's courses array
    await Mentor.findByIdAndUpdate(mentorId, {
      $pull: { courses: courseId },
    });

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting mentor course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reset mentor password (development tool)
// @route   POST /api/mentors/reset-password
// @access  Public (for development purposes)
const resetMentorPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    // Find the mentor
    const mentor = await Mentor.findOne({ email });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Log current password hash for debugging
    console.log(`🔄 Resetting password for mentor: ${email}`);
    console.log(
      `📋 Current password hash: ${mentor.password?.substring(0, 10)}...`
    );

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    mentor.password = hashedPassword;
    await mentor.save();

    console.log(
      `✅ Password reset successful, new hash: ${hashedPassword.substring(
        0,
        10
      )}...`
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("❌ Password reset error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
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
  getStudentDetails,
  sendMessageToStudent,
  getStudentAnalytics,
  getMentorNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  resetMentorPassword,
  updateMentorCourse,
  deleteMentorCourse,
};
