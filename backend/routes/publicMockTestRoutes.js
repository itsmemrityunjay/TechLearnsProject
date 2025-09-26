const express = require("express");
const router = express.Router();
const {
  getMockTests,
  startMockTest,
  submitMockTest,
  getUserMockTestResults,
  getMockTestsByCategory,
} = require("../controllers/mockTestController");
const { protect } = require("../middleware/auth");

// Public routes (anyone can view available tests)
router.get("/", getMockTests);
router.get("/category/:category", getMockTestsByCategory);

// Protected routes (students need to be logged in)
router.use(protect);

// Student-specific routes
router.get("/my-results", getUserMockTestResults);
router.get("/:id/start", startMockTest);
router.post("/:id/submit", submitMockTest);

module.exports = router;