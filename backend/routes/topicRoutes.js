const express = require("express");
const router = express.Router();
const {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  addQuestion,
  addAnswer,
  voteAnswer,
  acceptAnswer,
  getTopicsByCategory,
  // Add these new imports:
  likeTopic,
  unlikeTopic,
  bookmarkTopic,
  unbookmarkTopic,
  likeQuestion,
  unlikeQuestion,
} = require("../controllers/topicController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/", getTopics);
router.get("/category/:category", getTopicsByCategory);
router.get("/:id", getTopicById);

// Protected routes
router.route("/").post(protect, createTopic);

router.route("/:id").put(protect, updateTopic).delete(protect, deleteTopic);

router.route("/:id/questions").post(protect, addQuestion);

router.route("/:id/questions/:questionId/answers").post(protect, addAnswer);

router
  .route("/:id/questions/:questionId/answers/:answerId/vote")
  .put(protect, voteAnswer);

router
  .route("/:id/questions/:questionId/answers/:answerId/accept")
  .put(protect, acceptAnswer);

// Add these routes
router.route("/:id/like").post(protect, likeTopic).delete(protect, unlikeTopic);
router
  .route("/:id/bookmark")
  .post(protect, bookmarkTopic)
  .delete(protect, unbookmarkTopic);

// Like/unlike routes for questions
router
  .route("/:id/questions/:questionId/like")
  .post(protect, likeQuestion)
  .delete(protect, unlikeQuestion);

module.exports = router;
