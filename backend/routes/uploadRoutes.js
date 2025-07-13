const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");

// Use memory storage for cloud deployments
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload endpoint
router.post("/", protect, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // For cloud deployment, return base64 data
    const fileBuffer = req.file.buffer;
    const base64File = fileBuffer.toString("base64");

    res.json({
      message: "File uploaded successfully",
      url: `data:${req.file.mimetype};base64,${base64File}`,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

module.exports = router;
