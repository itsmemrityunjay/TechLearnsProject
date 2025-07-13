const express = require("express");
const router = express.Router();
const {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  submitCompetitionEntry,
  updateCompetitionStatus,
  getCompetitionParticipants,
  announceResults,
} = require("../controllers/competitionController");
const { protect } = require("../middleware/auth");

// Public routes
router.get("/", getCompetitions);
router.get("/:id", getCompetitionById);

// Protected routes
router.route("/").post(protect, createCompetition);

router
  .route("/:id")
  .put(protect, updateCompetition)
  .delete(protect, deleteCompetition);

router.post("/:id/register", protect, registerForCompetition);
router.post("/:id/submit", protect, submitCompetitionEntry);
router.put("/:id/status", protect, updateCompetitionStatus);
router.get("/:id/participants", protect, getCompetitionParticipants);
router.post("/:id/results", protect, announceResults);

module.exports = router;
