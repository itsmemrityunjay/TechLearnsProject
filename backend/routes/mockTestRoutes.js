const express = require("express");
const router = express.Router();
const {
  createMockTest,
  getMentorMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
  getMockTests,
  startMockTest,
  submitMockTest,
  getUserMockTestResults,
  getMockTestResults,
  getMockTestsByCategory,
} = require("../controllers/mockTestController");
const { protect, mentorOnly } = require("../middleware/auth");

// Public routes (for students to view and take tests)
router.get("/public", getMockTests);
router.get("/category/:category", getMockTestsByCategory);

// Student routes (protected)
router.get("/my-results", protect, getUserMockTestResults);
router.get("/:id/start", protect, startMockTest);
router.post("/:id/submit", protect, submitMockTest);

// Mentor routes (protected and mentor only)
router.use(protect);
router.use(mentorOnly);

// CRUD routes for mentors
router.route("/").post(createMockTest).get(getMentorMockTests);

router
  .route("/:id")
  .get(getMockTestById)
  .put(updateMockTest)
  .delete(deleteMockTest);

// Get results for a specific test (mentor only)
router.get("/:id/results", getMockTestResults);

module.exports = router;
