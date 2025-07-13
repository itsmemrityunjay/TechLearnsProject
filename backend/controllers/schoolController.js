const School = require("../models/schoolModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");

// @desc    Register a new school
// @route   POST /api/schools/register
// @access  Public
const registerSchool = async (req, res) => {
  try {
    const {
      organizationName,
      headName,
      headContactNumber,
      headEmail,
      organizationEmail,
      password,
      address,
      website,
      established,
      description,
    } = req.body;

    // Check if school already exists
    const schoolExists = await School.findOne({ organizationEmail });
    if (schoolExists) {
      return res.status(400).json({ message: "School already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create school
    const school = await School.create({
      organizationName,
      headName,
      headContactNumber,
      headEmail,
      organizationEmail,
      password: hashedPassword,
      address,
      website,
      established,
      description,
    });

    if (school) {
      res.status(201).json({
        _id: school._id,
        organizationName: school.organizationName,
        organizationEmail: school.organizationEmail,
        token: generateToken(school._id, "school"),
      });
    } else {
      res.status(400).json({ message: "Invalid school data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Auth school & get token
// @route   POST /api/schools/login
// @access  Public
const loginSchool = async (req, res) => {
  try {
    const { organizationEmail, password } = req.body;

    // Find school by email
    const school = await School.findOne({ organizationEmail });

    // Check if school exists and password matches
    if (school && (await bcrypt.compare(password, school.password))) {
      res.json({
        _id: school._id,
        organizationName: school.organizationName,
        organizationEmail: school.organizationEmail,
        token: generateToken(school._id, "school"),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get school profile
// @route   GET /api/schools/profile
// @access  Private
const getSchoolProfile = async (req, res) => {
  try {
    const school = await School.findById(req.school._id);
    if (school) {
      res.json({
        _id: school._id,
        organizationName: school.organizationName,
        headName: school.headName,
        headContactNumber: school.headContactNumber,
        headEmail: school.headEmail,
        organizationEmail: school.organizationEmail,
        address: school.address,
        logo: school.logo,
        website: school.website,
        established: school.established,
        description: school.description,
      });
    } else {
      res.status(404).json({ message: "School not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update school profile
// @route   PUT /api/schools/profile
// @access  Private
const updateSchoolProfile = async (req, res) => {
  try {
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Update fields
    school.organizationName =
      req.body.organizationName || school.organizationName;
    school.headName = req.body.headName || school.headName;
    school.headContactNumber =
      req.body.headContactNumber || school.headContactNumber;
    school.headEmail = req.body.headEmail || school.headEmail;
    school.address = req.body.address || school.address;
    school.logo = req.body.logo || school.logo;
    school.website = req.body.website || school.website;
    school.established = req.body.established || school.established;
    school.description = req.body.description || school.description;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      school.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedSchool = await school.save();
    res.json({
      _id: updatedSchool._id,
      organizationName: updatedSchool.organizationName,
      headName: updatedSchool.headName,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all schools
// @route   GET /api/schools
// @access  Public
const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find({}).select("-password");
    res.json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get school by ID
// @route   GET /api/schools/:id
// @access  Public
const getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id).select("-password");

    if (school) {
      res.json(school);
    } else {
      res.status(404).json({ message: "School not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete school
// @route   DELETE /api/schools/:id
// @access  Private (Admin only)
const deleteSchool = async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    await School.deleteOne({ _id: req.params.id });
    res.json({ message: "School removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add student to school
// @route   POST /api/schools/students
// @access  Private (School only)
const addStudent = async (req, res) => {
  try {
    const { userId } = req.body;
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if student is already added
    const studentExists = school.students.some(
      (student) => student.userId.toString() === userId
    );

    if (studentExists) {
      return res
        .status(400)
        .json({ message: "Student already added to school" });
    }

    school.students.push({
      userId,
      remarks: "",
      results: [],
      attendance: { present: 0, total: 0, percentage: 0 },
    });

    await school.save();

    // Update user's school/organization
    user.schoolOrganizationName = school.organizationName;
    await user.save();

    res.status(201).json({ message: "Student added to school" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update student remarks
// @route   PUT /api/schools/students/:studentId
// @access  Private (School only)
const updateStudentRemarks = async (req, res) => {
  try {
    const { remarks, results } = req.body;
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const studentIndex = school.students.findIndex(
      (student) => student.userId.toString() === req.params.studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({ message: "Student not found in school" });
    }

    // Update remarks
    if (remarks) {
      school.students[studentIndex].remarks = remarks;
    }

    // Add new result if provided
    if (results && results.length > 0) {
      results.forEach((result) => {
        school.students[studentIndex].results.push(result);
      });
    }

    await school.save();
    res.json({ message: "Student information updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update student attendance
// @route   PUT /api/schools/students/:studentId/attendance
// @access  Private (School only)
const updateStudentAttendance = async (req, res) => {
  try {
    const { present, total } = req.body;
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const studentIndex = school.students.findIndex(
      (student) => student.userId.toString() === req.params.studentId
    );

    if (studentIndex === -1) {
      return res.status(404).json({ message: "Student not found in school" });
    }

    // Update attendance
    school.students[studentIndex].attendance.present += present || 0;
    school.students[studentIndex].attendance.total += total || 0;

    // Calculate percentage
    const attendanceData = school.students[studentIndex].attendance;
    attendanceData.percentage =
      attendanceData.total > 0
        ? (attendanceData.present / attendanceData.total) * 100
        : 0;

    // Update user's attendance count
    const user = await User.findById(req.params.studentId);
    if (user) {
      user.attendanceCount = attendanceData.present;
      await user.save();
    }

    await school.save();
    res.json({
      message: "Attendance updated",
      attendance: school.students[studentIndex].attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get school's students
// @route   GET /api/schools/students
// @access  Private (School only)
const getSchoolStudents = async (req, res) => {
  try {
    const school = await School.findById(req.school._id).populate({
      path: "students.userId",
      select: "firstName lastName email profileImage",
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(school.students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get school's courses
// @route   GET /api/schools/courses
// @access  Private (School only)
const getSchoolCourses = async (req, res) => {
  try {
    const school = await School.findById(req.school._id).populate({
      path: "availableCourses.courseId",
      select: "title description type category isPremium thumbnail author",
      populate: {
        path: "author",
        select: "name profileImage",
      },
    });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json(school.availableCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add course to school
// @route   POST /api/schools/courses
// @access  Private (School only)
const addCourse = async (req, res) => {
  try {
    const { courseId, enrollmentStatus } = req.body;
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course is already added
    const courseExists = school.availableCourses.some(
      (c) => c.courseId.toString() === courseId
    );

    if (courseExists) {
      return res
        .status(400)
        .json({ message: "Course already added to school" });
    }

    school.availableCourses.push({
      courseId,
      enrollmentStatus: enrollmentStatus || "open",
    });

    await school.save();
    res.status(201).json({ message: "Course added to school" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove course from school
// @route   DELETE /api/schools/courses/:courseId
// @access  Private (School only)
const removeCourse = async (req, res) => {
  try {
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const courseIndex = school.availableCourses.findIndex(
      (course) => course.courseId.toString() === req.params.courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({ message: "Course not found in school" });
    }

    school.availableCourses.splice(courseIndex, 1);
    await school.save();

    res.json({ message: "Course removed from school" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update course enrollment status
// @route   PUT /api/schools/courses/:courseId
// @access  Private (School only)
const updateCourseStatus = async (req, res) => {
  try {
    const { enrollmentStatus } = req.body;
    const school = await School.findById(req.school._id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    const courseIndex = school.availableCourses.findIndex(
      (course) => course.courseId.toString() === req.params.courseId
    );

    if (courseIndex === -1) {
      return res.status(404).json({ message: "Course not found in school" });
    }

    school.availableCourses[courseIndex].enrollmentStatus = enrollmentStatus;
    await school.save();

    res.json({ message: "Course status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
