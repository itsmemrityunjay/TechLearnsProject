const express = require("express");
const router = express.Router();
const {
  registerMentor,
  loginMentor,
  getMentorProfile,
  updateMentorProfile,
  getAllMentors,
  getMentorById,
  getMentorStudents,
  getMentorClasses,
  getMentorNotifications,
  getMentorCourses,
  getMentorTopics,
  getMentorCompetitions,
  getMentorReviews,
  addMentorReview,
  deleteMentor,
  updateMentorAvailability,
  resetMentorPassword,
  updateMentorCourse,
  deleteMentorCourse,
} = require("../controllers/mentorController");
const { protect, admin, mentorOnly } = require("../middleware/auth");

// Public routes
router.post("/register", registerMentor);
router.post("/login", loginMentor);
router.post("/reset-password", resetMentorPassword);
router.get("/", getAllMentors);

// Protected routes - specific paths must come BEFORE parameter routes
router.get("/profile", protect, mentorOnly, getMentorProfile);
router.put("/profile", protect, mentorOnly, updateMentorProfile);
router.get("/students", protect, mentorOnly, getMentorStudents);
router.get("/classes", protect, mentorOnly, getMentorClasses);
router.get("/notifications", protect, mentorOnly, getMentorNotifications);
router.put("/availability", protect, mentorOnly, updateMentorAvailability);
router.get("/courses", protect, mentorOnly, getMentorCourses);
router.get("/topics", protect, mentorOnly, getMentorTopics);
router.get("/competitions", protect, mentorOnly, getMentorCompetitions);

// Course management routes
router.put("/courses/:courseId", protect, mentorOnly, updateMentorCourse);
router.delete("/courses/:courseId", protect, mentorOnly, deleteMentorCourse);

// Parameter routes must come AFTER specific routes
router.get("/:id", getMentorById);
router.get("/:id/reviews", getMentorReviews);
router.post("/:id/reviews", protect, addMentorReview);
router.delete("/:id", protect, admin, deleteMentor);

module.exports = router;
