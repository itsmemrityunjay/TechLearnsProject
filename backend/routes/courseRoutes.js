const express = require("express");
const router = express.Router();
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
  getMentorCourses, // Add this function import
} = require("../controllers/courseController");
const { protect, admin, mentorOnly } = require("../middleware/auth");

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

router.get("/:id/students", protect, mentorOnly, getEnrolledStudents);

// Protected routes - Users
router.post("/:id/enroll", protect, enrollInCourse);
router.post("/:id/rate", protect, rateCourse);
router.put("/:id/progress", protect, updateCourseProgress);

module.exports = router;
