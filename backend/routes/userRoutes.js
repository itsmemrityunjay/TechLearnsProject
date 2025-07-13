const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  deleteUser,
  updateBelowPovertyStatus,
  getUserNotebooks,
  getUserCourses,
  getUserCompetitions,
  getUserMocktestResults,
  updateUserAttendance,
  getUserBadges,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/auth");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image and PDF files are allowed!"));
  },
});

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get("/notebooks", protect, getUserNotebooks);
router.get("/courses", protect, getUserCourses);
router.get("/competitions", protect, getUserCompetitions);
router.get("/mock-tests", protect, getUserMocktestResults);
router.get("/badges", protect, getUserBadges);
router.put("/attendance", protect, updateUserAttendance);
router.put("/below-poverty", protect, updateBelowPovertyStatus);

// Add the upload route
router.post("/upload", protect, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Create the file URL (adjust based on your server setup)
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.json({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
      imageUrl: fileUrl, // Include both formats for compatibility
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed" });
  }
});

// Admin routes
router.route("/").get(protect, admin, getAllUsers);
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser);

module.exports = router;
