const express = require("express");
const router = express.Router();
const {
  createNotebook,
  getNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
  shareNotebook,
  getPublicNotebooks,
  addCollaborator,
  removeCollaborator,
  executeCode,
} = require("../controllers/notebookController");
const { protect, premiumOrRegistered } = require("../middleware/auth");

// Public routes
router.get("/public", getPublicNotebooks);
router.post("/execute", protect, executeCode);

// Protected routes
router
  .route("/")
  .post(protect, premiumOrRegistered, createNotebook)
  .get(protect, getNotebooks);

router
  .route("/:id")
  .get(protect, getNotebookById)
  .put(protect, updateNotebook)
  .delete(protect, deleteNotebook);

router.route("/:id/share").put(protect, shareNotebook);

router
  .route("/:id/collaborators")
  .post(protect, addCollaborator)
  .delete(protect, removeCollaborator);

module.exports = router;
