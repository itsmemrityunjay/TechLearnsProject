const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Mentor = require("../models/mentorModel");
const mongoose = require("mongoose");

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Mentor only)
const createCourse = async (req, res) => {
  try {
    console.log("Creating course with data:", req.body);
    const mentorId = req.mentor._id;

    // Check if mentor exists
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const {
      title,
      description,
      category,
      courseFor, // Add this line
      isPremium,
      price,
      thumbnail,
      objectives,
      content,
    } = req.body;

    // Format content items to remove temporary IDs
    let formattedContent = [];
    if (content && Array.isArray(content)) {
      formattedContent = content.map((item) => {
        // Remove the _id field so MongoDB will generate a proper ObjectId
        const { _id, ...contentWithoutId } = item;
        return contentWithoutId;
      });
    }

    // Create course
    const course = new Course({
      title,
      description,
      category,
      courseFor, // Add this line
      isPremium: isPremium || false,
      price: isPremium ? price : 0,
      thumbnail,
      objectives: objectives || [],
      content: formattedContent, // Use the cleaned content array
      createdBy: mentorId,
    });

    // Save course to database
    const savedCourse = await course.save();

    // Add course to mentor's courses
    mentor.courses = mentor.courses || [];
    mentor.courses.push(savedCourse._id);
    await mentor.save();

    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    // Parse query parameters
    const { type, category, level, isPremium, minRating, sortBy, keyword } =
      req.query;

    let query = {};

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (level) query.level = level;
    if (isPremium) query.isPremium = isPremium === "true";
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // Apply sorting
    let sort = {};
    if (sortBy === "newest") {
      sort = { createdAt: -1 };
    } else if (sortBy === "rating") {
      sort = { averageRating: -1 };
    } else if (sortBy === "popularity") {
      sort = { totalEnrollments: -1 };
    } else {
      // Default sorting
      sort = { createdAt: -1 };
    }

    const courses = await Course.find(query)
      .populate({
        path: "createdBy",
        select: "firstName lastName profileImage rating",
      })
      .sort(sort);

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "createdBy",
      select: "firstName lastName profileImage about",
    });

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Mentor only)
const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      courseFor, // Add this line
      isPremium,
      price,
      thumbnail,
      objectives,
      content,
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author
    if (!course.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    // Update basic fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (courseFor) course.courseFor = courseFor; // Add this line
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
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Mentor only)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author or user is admin
    const isAuthor = course.createdBy.equals(req.mentor._id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    // Remove course from mentor's courses
    await Mentor.findByIdAndUpdate(course.author, {
      $pull: { courses: course._id },
    });

    // Remove course from users' registeredCourses
    await User.updateMany(
      { "registeredCourses.courseId": course._id },
      { $pull: { registeredCourses: { courseId: course._id } } }
    );

    // Remove course from schools' availableCourses
    await mongoose
      .model("School")
      .updateMany(
        { "availableCourses.courseId": course._id },
        { $pull: { availableCourses: { courseId: course._id } } }
      );

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add course content
// @route   POST /api/courses/:id/content
// @access  Private (Mentor only)
const addCourseContent = async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      textContent,
      videoUrl,
      liveSessionDate,
      duration,
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author
    if (!course.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    const newContent = {
      title,
      description,
      contentType,
      textContent,
      videoUrl,
      liveSessionDate,
      duration,
    };

    course.content.push(newContent);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update course content
// @route   PUT /api/courses/:id/content/:contentId
// @access  Private (Mentor only)
const updateCourseContent = async (req, res) => {
  try {
    const {
      title,
      description,
      contentType,
      textContent,
      videoUrl,
      liveSessionDate,
      duration,
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author
    if (!course.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    // Find the content item
    const contentIndex = course.content.findIndex(
      (c) => c._id.toString() === req.params.contentId
    );

    if (contentIndex === -1) {
      return res.status(404).json({ message: "Content item not found" });
    }

    // Update content fields
    if (title) course.content[contentIndex].title = title;
    if (description) course.content[contentIndex].description = description;
    if (contentType) course.content[contentIndex].contentType = contentType;
    if (textContent !== undefined)
      course.content[contentIndex].textContent = textContent;
    if (videoUrl !== undefined)
      course.content[contentIndex].videoUrl = videoUrl;
    if (liveSessionDate)
      course.content[contentIndex].liveSessionDate = liveSessionDate;
    if (duration) course.content[contentIndex].duration = duration;

    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete course content
// @route   DELETE /api/courses/:id/content/:contentId
// @access  Private (Mentor only)
const deleteCourseContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author
    if (!course.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    // Find and remove the content item
    const contentExists = course.content.some(
      (c) => c._id.toString() === req.params.contentId
    );

    if (!contentExists) {
      return res.status(404).json({ message: "Content item not found" });
    }

    course.content = course.content.filter(
      (c) => c._id.toString() !== req.params.contentId
    );
    await course.save();

    res.json({ message: "Content removed", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Enroll user in course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Get user ID from auth middleware - handle both patterns
    let userId;
    if (req.user && req.user._id) {
      userId = req.user._id;
    } else if (req.userId) {
      userId = req.userId;
    } else {
      console.error("No user ID found in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const { paymentCompleted, paymentId } = req.body;

    console.log(`Enrolling user ${userId} in course ${courseId}`);
    console.log("Request body:", JSON.stringify(req.body));

    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.error("Invalid course ID format");
      return res.status(400).json({ message: "Invalid course ID format" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID format");
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Wait for database connection
    let retries = 0;
    const maxRetries = 3;
    
    while (mongoose.connection.readyState !== 1 && retries < maxRetries) {
      console.log(`Waiting for database connection... (attempt ${retries + 1})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }

    if (mongoose.connection.readyState !== 1) {
      console.error("Database connection not ready");
      return res.status(503).json({ message: "Database temporarily unavailable" });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      console.error("Course not found:", courseId);
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("Course found:", course.title);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email);

    // Initialize arrays if they don't exist
    if (!user.registeredCourses) {
      user.registeredCourses = [];
    }
    
    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    
    // Check if already enrolled
    const alreadyEnrolled = user.registeredCourses.some(rc => {
      if (!rc.courseId) return false;
      return rc.courseId.toString() === courseId;
    });

    if (alreadyEnrolled) {
      console.log("User already enrolled");
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Handle premium course enrollment
    if (course.isPremium && !user.isPremium && !user.belowPoverty?.verified) {
      if (!paymentCompleted) {
        console.log("Payment required for premium course");
        return res.status(402).json({
          message: "Payment required for this premium course",
        });
      }
      
      if (!paymentId) {
        console.log("Payment ID missing for premium course");
        return res.status(400).json({
          message: "Payment ID is required for premium course enrollment",
        });
      }
    }

    console.log("Creating enrollment object");

    // Create enrollment object
    const enrollment = {
      courseId: course._id,
      enrolledOn: new Date(),
      progress: 0,
      completed: false,
    };

    if (paymentId) {
      enrollment.paymentId = paymentId;
      enrollment.isPaid = true;
    }

    // Add course to user's registeredCourses
    user.registeredCourses.push(enrollment);
    
    // Add user to course's enrolledStudents if not already there
    const userAlreadyInCourse = course.enrolledStudents.some(studentId => 
      studentId && studentId.toString() === userId.toString()
    );
    
    if (!userAlreadyInCourse) {
      course.enrolledStudents.push(userId);
    }
    
    // Update total enrollments
    if (typeof course.totalEnrollments !== "number") {
      course.totalEnrollments = course.enrolledStudents.length;
    } else {
      course.totalEnrollments += 1;
    }

    console.log("Saving user and course data");

    // Save both documents
    await user.save();
    console.log("User saved successfully");
    
    await course.save();
    console.log("Course saved successfully");

    console.log("Enrollment completed successfully");

    return res.status(201).json({
      message: "Successfully enrolled in course",
      courseId: course._id,
      courseName: course.title,
      isPaid: !!paymentId,
      enrollmentDate: new Date(),
      success: true
    });

  } catch (error) {
    console.error("Enrollment error:", error);
    console.error("Error stack:", error.stack);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(field => 
        `${field}: ${error.errors[field].message}`
      );
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({ 
        message: "Database error during enrollment"
      });
    }
    
    res.status(500).json({ 
      message: "Server error during enrollment", 
      error: error.message 
    });
  }
};

// @desc    Rate course
// @route   POST /api/courses/:id/rate
// @access  Private
const rateCourse = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is enrolled in the course
    const user = await User.findById(req.user._id);
    const isEnrolled = user.registeredCourses.some(
      (rc) => rc.courseId.toString() === course._id.toString()
    );

    if (!isEnrolled) {
      return res
        .status(403)
        .json({ message: "You must be enrolled in the course to rate it" });
    }

    // Check if user has already rated the course
    const existingRatingIndex = course.ratings.findIndex(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      course.ratings[existingRatingIndex].rating = rating;
      course.ratings[existingRatingIndex].review = review;
      course.ratings[existingRatingIndex].date = Date.now();
    } else {
      // Add new rating
      course.ratings.push({
        userId: req.user._id,
        rating,
        review,
        date: Date.now(),
      });
    }

    // Calculate average rating
    const totalRating = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.averageRating = totalRating / course.ratings.length;

    await course.save();
    res.status(201).json({ message: "Course rated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get enrolled students
// @route   GET /api/courses/:id/students
// @access  Private (Mentor only)
const getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "enrolledStudents",
      select: "firstName lastName email profileImage",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if mentor is the author
    if (!course.author.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this information" });
    }

    res.json(course.enrolledStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get course ratings
// @route   GET /api/courses/:id/ratings
// @access  Public
const getCourseRatings = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: "ratings.userId",
      select: "firstName lastName profileImage",
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({
      ratings: course.ratings,
      averageRating: course.averageRating,
      totalRatings: course.ratings.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
const updateCourseProgress = async (req, res) => {
  try {
    const { progress, completed } = req.body;
    const courseId = req.params.id;

    const user = await User.findById(req.user._id);
    const courseIndex = user.registeredCourses.findIndex(
      (course) => course.courseId.toString() === courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({ message: "Course enrollment not found" });
    }

    // Update progress
    if (progress !== undefined) {
      user.registeredCourses[courseIndex].progress = progress;
    }

    // Update completion status
    if (completed !== undefined) {
      user.registeredCourses[courseIndex].completed = completed;

      // If completed, award badge
      if (
        completed &&
        !user.badges.some((badge) => badge.name === "Course Completion")
      ) {
        const course = await Course.findById(courseId);
        user.badges.push({
          name: "Course Completion",
          description: `Completed the course: ${course.title}`,
          image: "https://example.com/badge-image.png",
          earnedAt: Date.now(),
        });
      }
    }

    await user.save();
    res.json({
      message: "Course progress updated",
      courseProgress: user.registeredCourses[courseIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get courses by the logged-in mentor
// @route   GET /api/courses/mentor
// @access  Private (Mentor only)
const getMentorCourses = async (req, res) => {
  try {
    // req.mentor should be available from the mentorOnly middleware
    const courses = await Course.find({ createdBy: req.mentor._id })
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error("Error in getMentorCourses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addCourseContent,
  updateCourseContent,
  deleteCourseContent,
  enrollInCourse,
  rateCourse,
  getEnrolledStudents,
  getCourseRatings,
  updateCourseProgress,
  getMentorCourses, // Add this line
};
