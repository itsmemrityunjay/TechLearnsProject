const MockTest = require("../models/mockTestModel");
const User = require("../models/userModel");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");

// @desc    Create a new mock test
// @route   POST /api/mocktests
// @access  Private (Mentor only)
const createMockTest = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      timeLimit,
      passingScore,
      isActive,
      questions,
    } = req.body;

    // Validate required fields
    if (!title || !courseId || !questions || questions.length === 0) {
      return res.status(400).json({
        message: "Please provide title, course, and at least one question",
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify mentor is the course creator
    if (!course.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to create tests for this course" });
    }

    // Process questions - validate they have all required fields
    const processedQuestions = questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
    }));

    // Create mock test
    const mockTest = await MockTest.create({
      title,
      description: description || "",
      courseId,
      createdBy: req.mentor._id,
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 70,
      isActive: isActive || false,
      questions: processedQuestions,
    });

    res.status(201).json(mockTest);
  } catch (error) {
    console.error("Error creating mock test:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all mock tests
// @route   GET /api/mock-tests
// @access  Public
const getMockTests = async (req, res) => {
  try {
    // Parse query parameters
    const { category, forLevel, isPremium } = req.query;
    const query = {};

    if (category) query.category = category;
    if (forLevel) query.forLevel = forLevel;
    if (isPremium !== undefined) query.isPremium = isPremium === "true";

    const mockTests = await MockTest.find(query)
      .populate({
        path: "createdBy",
        select: "name profileImage",
      })
      .select("-questions.correctAnswer -questions.explanation");

    res.json(mockTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get mock tests by category
// @route   GET /api/mock-tests/category/:category
// @access  Public
const getMockTestsByCategory = async (req, res) => {
  try {
    const mockTests = await MockTest.find({ category: req.params.category })
      .populate({
        path: "createdBy",
        select: "name profileImage",
      })
      .select("-questions.correctAnswer -questions.explanation");

    res.json(mockTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a mock test by ID
// @route   GET /api/mocktests/:id
// @access  Private (Mentor only)
const getMockTestById = async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id).populate(
      "courseId",
      "title"
    );

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    // Check if the mentor is the creator
    if (!mockTest.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this mock test" });
    }

    res.json(mockTest);
  } catch (error) {
    console.error("Error fetching mock test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a mock test
// @route   PUT /api/mocktests/:id
// @access  Private (Mentor only)
const updateMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id);

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    // Check if the mentor is the creator
    if (!mockTest.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this mock test" });
    }

    const {
      title,
      description,
      courseId,
      timeLimit,
      passingScore,
      isActive,
      questions,
    } = req.body;

    if (courseId) {
      // Verify course exists and mentor is the owner
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (!course.createdBy.equals(req.mentor._id)) {
        return res
          .status(403)
          .json({ message: "Not authorized to use this course" });
      }

      mockTest.courseId = courseId;
    }

    // Update fields
    if (title) mockTest.title = title;
    if (description !== undefined) mockTest.description = description;
    if (timeLimit) mockTest.timeLimit = timeLimit;
    if (passingScore !== undefined) mockTest.passingScore = passingScore;
    if (isActive !== undefined) mockTest.isActive = isActive;
    if (questions && questions.length > 0) mockTest.questions = questions;

    const updatedMockTest = await mockTest.save();
    res.json(updatedMockTest);
  } catch (error) {
    console.error("Error updating mock test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a mock test
// @route   DELETE /api/mocktests/:id
// @access  Private (Mentor only)
const deleteMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id);

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    // Check if the mentor is the creator
    if (!mockTest.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this mock test" });
    }

    await mockTest.remove();
    res.json({ message: "Mock test deleted successfully" });
  } catch (error) {
    console.error("Error deleting mock test:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Start taking a mock test
// @route   POST /api/mock-tests/:id/start
// @access  Private
const takeMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id);

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    // Check if premium test and user has access
    if (
      mockTest.isPremium &&
      !req.user.isPremium &&
      !req.user.belowPoverty.verified
    ) {
      return res
        .status(403)
        .json({ message: "Premium access required for this mock test" });
    }

    // Return mock test without correct answers
    const testForUser = mockTest.toObject();
    testForUser.questions = testForUser.questions.map((q) => ({
      ...q,
      correctAnswer: undefined,
      explanation: undefined,
    }));

    res.json({
      testId: mockTest._id,
      title: mockTest.title,
      duration: mockTest.duration,
      questions: testForUser.questions,
      startTime: Date.now(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Submit mock test answers
// @route   POST /api/mock-tests/:id/submit
// @access  Private
const submitMockTest = async (req, res) => {
  try {
    const { answers } = req.body;
    const mockTest = await MockTest.findById(req.params.id);

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;

    mockTest.questions.forEach((question, index) => {
      const points = question.points || 1;
      maxScore += points;

      if (answers[index] === question.correctAnswer) {
        score += points;
      }
    });

    // Store result in user's mock test results
    const user = await User.findById(req.user._id);
    user.mocktestResults.push({
      testId: mockTest._id,
      score,
      maxScore,
      takenAt: Date.now(),
    });

    await user.save();

    // Return results with explanations
    const results = mockTest.questions.map((question, index) => ({
      question: question.question,
      userAnswer: answers[index],
      correctAnswer: question.correctAnswer,
      isCorrect: answers[index] === question.correctAnswer,
      explanation: question.explanation,
      points: question.points || 1,
    }));

    res.json({
      score,
      maxScore,
      percentage: (score / maxScore) * 100,
      results,
      passThreshold: 70, // Example threshold
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's mock test results
// @route   GET /api/mock-tests/results
// @access  Private
const getMockTestResults = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "mocktestResults.testId",
      select: "title category forLevel",
    });

    res.json(user.mocktestResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all mock tests created by the current mentor
// @route   GET /api/mock-tests/mentor
// @access  Private (Mentor only)
const getMockTestsByMentor = async (req, res) => {
  try {
    const mockTests = await MockTest.find({ createdBy: req.mentor._id })
      .populate("courseId", "title")
      .populate("createdBy", "name profileImage");

    res.status(200).json(mockTests);
  } catch (error) {
    console.error("Error fetching mentor mock tests:", error);
    res.status(500).json({ message: "Server error while fetching mock tests" });
  }
};

// @desc    Get all mock tests for the logged-in mentor
// @route   GET /api/mocktests
// @access  Private (Mentor only)
const getMentorMockTests = async (req, res) => {
  try {
    const mentorId = req.mentor._id;

    const mockTests = await MockTest.find({ createdBy: mentorId })
      .populate("courseId", "title")
      .sort({ createdAt: -1 });

    console.log(
      `Found ${mockTests.length} mock tests for mentor ID: ${mentorId}`
    );
    res.json(mockTests);
  } catch (error) {
    console.error("Error fetching mentor mock tests:", error);
    res.status(500).json({
      message: "Server error while fetching mock tests",
      error: error.message,
    });
  }
};

module.exports = {
  createMockTest,
  getMockTests,
  getMockTestById,
  updateMockTest,
  deleteMockTest,
  takeMockTest,
  submitMockTest,
  getMockTestResults,
  getMockTestsByCategory,
  getMockTestsByMentor,
  getMentorMockTests,
};
