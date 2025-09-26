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

// Configure multer for video uploads - use memory storage for serverless compatibility
const storage = multer.memoryStorage(); // Always use memory storage for Vercel compatibility

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

// Test endpoint to verify course video upload route
router.post("/:id/video-test", protect, mentorOnly, (req, res) => {
  console.log('Video test route hit:', {
    courseId: req.params.id,
    mentorId: req.mentor?._id,
    method: req.method,
    headers: req.headers
  });
  
  res.json({
    success: true,
    message: "Course video test route working",
    data: {
      courseId: req.params.id,
      mentorId: req.mentor._id,
      timestamp: new Date().toISOString()
    }
  });
});

// Video upload route with comprehensive error handling
router.post("/:id/video", (req, res, next) => {
  console.log('=== VIDEO UPLOAD ROUTE START ===');
  console.log('Request details:', {
    method: req.method,
    url: req.url,
    courseId: req.params.id,
    headers: {
      'content-type': req.get('content-type'),
      'content-length': req.get('content-length'),
      'authorization': req.get('authorization') ? 'Bearer [REDACTED]' : 'None'
    }
  });
  next();
}, protect, (req, res, next) => {
  console.log('=== AFTER PROTECT MIDDLEWARE ===');
  console.log('User authenticated:', {
    userId: req.userId,
    role: req.role
  });
  next();
}, mentorOnly, (req, res, next) => {
  console.log('=== AFTER MENTOR MIDDLEWARE ===');
  console.log('Mentor details:', {
    mentorId: req.mentor?._id,
    mentorEmail: req.mentor?.email
  });
  next();
}, (req, res, next) => {
  console.log('=== BEFORE MULTER MIDDLEWARE ===');
  
  upload.single('file')(req, res, (err) => {
    console.log('=== AFTER MULTER PROCESSING ===');
    
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
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
      console.error('Upload middleware error:', err);
      return res.status(400).json({ 
        success: false,
        message: err.message 
      });
    }
    
    console.log('Multer processed successfully, file:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? `${req.file.buffer.length} bytes` : 'No buffer'
    } : 'No file');
    
    next();
  });
}, uploadCourseVideo);

router.get("/:id/students", protect, mentorOnly, getEnrolledStudents);

// Protected routes - Users
router.post("/:id/enroll", protect, enrollInCourse);
router.post("/:id/rate", protect, rateCourse);
router.put("/:id/progress", protect, updateCourseProgress);

module.exports = router;
