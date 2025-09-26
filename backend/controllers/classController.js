const mongoose = require("mongoose");
const Class = require("../models/classModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");

// @desc    Get all available classes for students to browse
// @route   GET /api/classes/public
// @access  Public
const getAvailableClasses = async (req, res) => {
  try {
    const classes = await Class.find({ 
      isCancelled: false,
      status: { $ne: 'cancelled' },
      startTime: { $gt: new Date() } // Only show upcoming classes
    })
      .populate("mentor", "firstName lastName profileImage")
      .populate("course", "title category")
      .sort({ startTime: 1 });

    res.json(classes);
  } catch (error) {
    console.error("Error fetching available classes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Mentor only)
const createClass = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      startTime,
      endTime,
      meetingLink,
      maxStudents,
      topics,
      materials
    } = req.body;

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ 
        message: "Title, start time, and end time are required" 
      });
    }

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    // If course is specified, verify it exists and belongs to mentor
    let course = null;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (!course.createdBy.equals(req.mentor._id)) {
        return res.status(403).json({ 
          message: "Not authorized to create class for this course" 
        });
      }
    }

    // Create new class
    const classData = new Class({
      title,
      description,
      mentor: req.mentor._id,
      course: courseId || undefined,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      meetingLink,
      materials: materials || []
    });

    // If course is specified, auto-enroll course students
    if (course && course.enrolledStudents && course.enrolledStudents.length > 0) {
      classData.enrolledStudents = course.enrolledStudents;
    }

    const savedClass = await classData.save();
    
    // Populate the response
    const populatedClass = await Class.findById(savedClass._id)
      .populate("mentor", "firstName lastName profileImage")
      .populate("course", "title")
      .populate("enrolledStudents", "firstName lastName email profileImage");

    res.status(201).json(populatedClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all classes for a mentor
// @route   GET /api/classes
// @access  Private (Mentor only)
const getClasses = async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    
    const classes = await Class.find({ mentor: mentorId })
      .populate("course", "title category")
      .populate("enrolledStudents", "firstName lastName email profileImage")
      .sort({ startTime: 1 });

    res.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a specific class by ID
// @route   GET /api/classes/:id
// @access  Private (Mentor only)
const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate("mentor", "firstName lastName profileImage")
      .populate("course", "title category")
      .populate("enrolledStudents", "firstName lastName email profileImage");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if mentor is the owner
    if (!classData.mentor._id.equals(req.mentor._id)) {
      return res.status(403).json({ 
        message: "Not authorized to view this class" 
      });
    }

    res.json(classData);
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Mentor only)
const updateClass = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      startTime,
      endTime,
      meetingLink,
      materials,
      status
    } = req.body;

    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if mentor is the owner
    if (!classData.mentor.equals(req.mentor._id)) {
      return res.status(403).json({ 
        message: "Not authorized to update this class" 
      });
    }

    // Validate times if provided
    const newStartTime = startTime ? new Date(startTime) : classData.startTime;
    const newEndTime = endTime ? new Date(endTime) : classData.endTime;
    
    if (newEndTime <= newStartTime) {
      return res.status(400).json({
        message: "End time must be after start time"
      });
    }

    // Update fields
    classData.title = title || classData.title;
    classData.description = description || classData.description;
    classData.course = courseId || classData.course;
    classData.startTime = newStartTime;
    classData.endTime = newEndTime;
    classData.meetingLink = meetingLink || classData.meetingLink;
    classData.materials = materials || classData.materials;
    classData.status = status || classData.status;

    if (status === 'cancelled') {
      classData.isCancelled = true;
    }

    const updatedClass = await classData.save();
    
    // Populate and return
    const populatedClass = await Class.findById(updatedClass._id)
      .populate("mentor", "firstName lastName profileImage")
      .populate("course", "title")
      .populate("enrolledStudents", "firstName lastName email profileImage");

    res.json(populatedClass);
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Mentor only)
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if mentor is the owner
    if (!classData.mentor.equals(req.mentor._id)) {
      return res.status(403).json({ 
        message: "Not authorized to delete this class" 
      });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Take attendance for a class
// @route   PUT /api/classes/:id/attendance
// @access  Private (Mentor only)
const takeAttendance = async (req, res) => {
  try {
    const { attendanceData } = req.body;
    
    if (!attendanceData || typeof attendanceData !== 'object') {
      return res.status(400).json({ 
        message: "Valid attendance data is required" 
      });
    }

    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if mentor is the owner
    if (!classData.mentor.equals(req.mentor._id)) {
      return res.status(403).json({ 
        message: "Not authorized to take attendance for this class" 
      });
    }

    // Update attendance
    classData.attendance = new Map(Object.entries(attendanceData));
    
    // If class hasn't started yet, don't allow taking attendance
    if (new Date() < classData.startTime) {
      return res.status(400).json({ 
        message: "Cannot take attendance before class starts" 
      });
    }

    await classData.save();

    // Update class status to completed if attendance is taken after class time
    if (new Date() > classData.endTime && classData.status !== 'completed') {
      classData.status = 'completed';
      await classData.save();
    }

    res.json({ 
      message: "Attendance recorded successfully", 
      attendance: Object.fromEntries(classData.attendance)
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get attendance for a class
// @route   GET /api/classes/:id/attendance
// @access  Private (Mentor only)
const getAttendance = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate("enrolledStudents", "firstName lastName email profileImage");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if mentor is the owner
    if (!classData.mentor.equals(req.mentor._id)) {
      return res.status(403).json({ 
        message: "Not authorized to view attendance for this class" 
      });
    }

    const attendanceData = Object.fromEntries(classData.attendance);
    
    // Create attendance summary
    const attendanceSummary = classData.enrolledStudents.map(student => ({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        profileImage: student.profileImage
      },
      isPresent: attendanceData[student._id.toString()] || false
    }));

    res.json({
      class: {
        _id: classData._id,
        title: classData.title,
        startTime: classData.startTime,
        endTime: classData.endTime
      },
      attendance: attendanceSummary,
      summary: {
        totalStudents: classData.enrolledStudents.length,
        presentStudents: Object.values(attendanceData).filter(Boolean).length,
        absentStudents: classData.enrolledStudents.length - Object.values(attendanceData).filter(Boolean).length
      }
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Enroll a student in a class
// @route   POST /api/classes/:id/enroll
// @access  Private (Student)
const enrollInClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if student is already enrolled
    if (classData.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ 
        message: "Already enrolled in this class" 
      });
    }

    // Check if class is not cancelled
    if (classData.isCancelled || classData.status === 'cancelled') {
      return res.status(400).json({ 
        message: "Cannot enroll in cancelled class" 
      });
    }

    // Check if class has already ended
    if (new Date() > classData.endTime) {
      return res.status(400).json({ 
        message: "Cannot enroll in past class" 
      });
    }

    // Check if class is not private and student has access
    if (!classData.isPublic && classData.course) {
      const user = await User.findById(req.user._id);
      if (!user.enrolledCourses.includes(classData.course)) {
        return res.status(403).json({
          message: "This class is only available to students enrolled in the associated course"
        });
      }
    }

    // Check capacity
    if (classData.enrolledStudents.length >= classData.maxStudents) {
      // Add to waiting list if not already there
      if (!classData.waitingList.includes(req.user._id)) {
        classData.waitingList.push(req.user._id);
        await classData.save();
      }
      return res.status(400).json({ 
        message: "Class is full. You have been added to the waiting list." 
      });
    }

    // Add student to enrolled students
    classData.enrolledStudents.push(req.user._id);
    
    // Remove from waiting list if they were there
    classData.waitingList = classData.waitingList.filter(
      id => !id.equals(req.user._id)
    );

    await classData.save();

    res.json({ message: "Successfully enrolled in class" });
  } catch (error) {
    console.error("Error enrolling in class:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get classes for a student
// @route   GET /api/classes/student/my-classes
// @access  Private (Student)
const getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({ 
      enrolledStudents: req.user._id,
      isCancelled: false 
    })
      .populate("mentor", "firstName lastName profileImage")
      .populate("course", "title category")
      .sort({ startTime: 1 });

    res.json(classes);
  } catch (error) {
    console.error("Error fetching student classes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add materials to a class
// @route   POST /api/classes/:id/materials
// @access  Private (Mentor only)
const addClassMaterials = async (req, res) => {
  try {
    const { materials } = req.body;
    
    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({ 
        message: "Valid materials array is required" 
      });
    }

    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if mentor is the owner
    if (!classData.mentor.equals(req.mentor._id)) {
      return res.status(403).json({ 
        message: "Not authorized to add materials to this class" 
      });
    }

    // Add materials
    classData.materials.push(...materials);
    await classData.save();

    res.json({ 
      message: "Materials added successfully", 
      materials: classData.materials 
    });
  } catch (error) {
    console.error("Error adding materials:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};