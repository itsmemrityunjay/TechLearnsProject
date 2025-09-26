const express = require("express");
const router = express.Router();
const {
  getAvailableClasses,
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  takeAttendance,
  getAttendance,
  enrollInClass,
  getStudentClasses,
  addClassMaterials
} = require("../controllers/classController");
const { protect, mentorOnly } = require("../middleware/auth");

// Public routes
router.get("/public", getAvailableClasses);

// Student routes (for enrolling and viewing their classes)
router.get("/student/my-classes", protect, getStudentClasses);
router.post("/:id/enroll", protect, enrollInClass);

// Mentor routes
router.use(protect);
router.use(mentorOnly);

// CRUD operations for mentors
router.route("/")
  .post(createClass)
  .get(getClasses);

router.route("/:id")
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

// Attendance management
router.route("/:id/attendance")
  .get(getAttendance)
  .put(takeAttendance);

// Materials management
router.post("/:id/materials", addClassMaterials);

module.exports = router;