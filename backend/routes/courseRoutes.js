const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
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
  getMentorCourses,
  uploadCourseVideo,
} = require("../controllers/courseController");
const { protect, admin, mentorOnly } = require("../middleware/auth");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Generate unique filename with original extension
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB limit for videos
  },
  fileFilter: function (req, file, cb) {
    // Allow video files
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported formats: MP4, AVI, MOV, WMV, WebM, QuickTime'));
    }
  },
});

// Public routes
router.get("/", getCourses);

// Special routes must come BEFORE :id route
router.get("/mentor", protect, mentorOnly, getMentorCourses); // Add this line

router.get("/:id", getCourseById);
router.get("/:id/ratings", getCourseRatings);

// Protected routes - Mentors
router.route("/").post(protect, mentorOnly, createCourse);

router
  .route("/:id")
  .put(protect, mentorOnly, updateCourse)
  .delete(protect, mentorOnly, deleteCourse);

router.route("/:id/content").post(protect, mentorOnly, addCourseContent);

router
  .route("/:id/content/:contentId")
  .put(protect, mentorOnly, updateCourseContent)
  .delete(protect, mentorOnly, deleteCourseContent);

// Video upload route with error handling
router.post("/:id/video", protect, mentorOnly, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          message: 'File too large. Maximum size is 500MB.' 
        });
      }
      return res.status(400).json({ 
        success: false,
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    next();
  });
}, uploadCourseVideo);

router.get("/:id/students", protect, mentorOnly, getEnrolledStudents);

// Protected routes - Users
router.post("/:id/enroll", protect, enrollInCourse);
router.post("/:id/rate", protect, rateCourse);
router.put("/:id/progress", protect, updateCourseProgress);

module.exports = router;
