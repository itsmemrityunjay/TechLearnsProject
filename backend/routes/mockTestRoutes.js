const express = require("express");
const router = express.Router();
const {
  createMockTest,
  getMentorMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
} = require("../controllers/mockTestController");
const { protect, mentorOnly } = require("../middleware/auth");

// All routes use mentor authentication
router.use(protect);
router.use(mentorOnly);

// CRUD routes
router.route("/").post(createMockTest).get(getMentorMockTests); // This uses the newly defined function

router
  .route("/:id")
  .get(getMockTestById)
  .put(updateMockTest)
  .delete(deleteMockTest);

module.exports = router;
