const express = require("express");
const router = express.Router();
const {
  registerSchool,
  loginSchool,
  getSchoolProfile,
  updateSchoolProfile,
  getAllSchools,
  getSchoolById,
  deleteSchool,
  addStudent,
  updateStudentRemarks,
  updateStudentAttendance,
  getSchoolStudents,
  getSchoolCourses,
  addCourse,
  removeCourse,
  updateCourseStatus,
} = require("../controllers/schoolController");
const { protect, admin, schoolOnly } = require("../middleware/auth");

// Public routes
router.post("/register", registerSchool);
router.post("/login", loginSchool);
router.get("/", getAllSchools);
router.get("/:id", getSchoolById);

// Protected routes
router
  .route("/profile")
  .get(protect, schoolOnly, getSchoolProfile)
  .put(protect, schoolOnly, updateSchoolProfile);

router
  .route("/students")
  .get(protect, schoolOnly, getSchoolStudents)
  .post(protect, schoolOnly, addStudent);

router
  .route("/students/:studentId")
  .put(protect, schoolOnly, updateStudentRemarks);

router
  .route("/students/:studentId/attendance")
  .put(protect, schoolOnly, updateStudentAttendance);

router
  .route("/courses")
  .get(protect, schoolOnly, getSchoolCourses)
  .post(protect, schoolOnly, addCourse);

router
  .route("/courses/:courseId")
  .delete(protect, schoolOnly, removeCourse)
  .put(protect, schoolOnly, updateCourseStatus);

// Admin routes
router.delete("/:id", protect, admin, deleteSchool);

module.exports = router;
