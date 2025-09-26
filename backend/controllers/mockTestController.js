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
      points: q.points || 1,
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

// @desc    Get all public mock tests for students
// @route   GET /api/mock-tests
// @access  Public
const getMockTests = async (req, res) => {
  try {
    // Parse query parameters
    const { category, forLevel, isPremium } = req.query;
    const query = { isActive: true }; // Only show active tests

    if (category) query.category = category;
    if (forLevel) query.forLevel = forLevel;
    if (isPremium !== undefined) query.isPremium = isPremium === "true";

    const mockTests = await MockTest.find(query)
      .populate("courseId", "title category")
      .populate("createdBy", "firstName lastName profileImage")
      .select("-questions.correctAnswer -questions.explanation -attempts");

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
    const mockTests = await MockTest.find({ 
      category: req.params.category,
      isActive: true 
    })
      .populate("createdBy", "firstName lastName profileImage")
      .select("-questions.correctAnswer -questions.explanation -attempts");

    res.json(mockTests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a mock test by ID for mentor
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

// @desc    Get a mock test for student (without answers)
// @route   GET /api/mock-tests/:id/start
// @access  Private (Student)
const startMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id)
      .populate("courseId", "title")
      .populate("createdBy", "firstName lastName");

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    if (!mockTest.isActive) {
      return res.status(403).json({ message: "This test is not currently active" });
    }

    // Check if user has already attempted this test
    const existingAttempt = mockTest.attempts.find(
      attempt => attempt.userId.toString() === req.user._id.toString()
    );

    if (existingAttempt) {
      return res.status(409).json({ 
        message: "You have already attempted this test",
        previousAttempt: {
          score: existingAttempt.score,
          maxScore: existingAttempt.maxScore,
          percentage: existingAttempt.percentage,
          submittedAt: existingAttempt.submittedAt
        }
      });
    }

    // Return mock test without correct answers and explanations
    const testForStudent = {
      _id: mockTest._id,
      title: mockTest.title,
      description: mockTest.description,
      timeLimit: mockTest.timeLimit,
      passingScore: mockTest.passingScore,
      courseId: mockTest.courseId,
      createdBy: mockTest.createdBy,
      questions: mockTest.questions.map((q, index) => ({
        _id: q._id,
        questionNumber: index + 1,
        question: q.question,
        options: q.options,
        points: q.points || 1,
      })),
      totalQuestions: mockTest.questions.length,
      totalPoints: mockTest.questions.reduce((sum, q) => sum + (q.points || 1), 0),
    };

    res.json(testForStudent);
  } catch (error) {
    console.error("Error starting mock test:", error);
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
// @access  Private (Student)
const submitMockTest = async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const mockTestId = req.params.id;
    const userId = req.user._id;

    console.log("Submitting mock test:", { mockTestId, userId, answers, timeSpent });

    const mockTest = await MockTest.findById(mockTestId);

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    if (!mockTest.isActive) {
      return res.status(403).json({ message: "This test is not currently active" });
    }

    // Check if user has already attempted this test
    const existingAttempt = mockTest.attempts.find(
      attempt => attempt.userId.toString() === userId.toString()
    );

    if (existingAttempt) {
      return res.status(409).json({ message: "You have already submitted this test" });
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;
    const results = [];

    mockTest.questions.forEach((question, index) => {
      const points = question.points || 1;
      maxScore += points;
      
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += points;
      }

      results.push({
        questionNumber: index + 1,
        question: question.question,
        options: question.options,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation,
        points: points,
        earnedPoints: isCorrect ? points : 0,
      });
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= mockTest.passingScore;

    // Add attempt to mock test
    mockTest.attempts.push({
      userId: userId,
      answers: answers,
      score: score,
      maxScore: maxScore,
      percentage: percentage,
      timeSpent: timeSpent || 0,
      submittedAt: new Date(),
    });

    // Update statistics
    mockTest.totalAttempts += 1;
    const totalScore = mockTest.attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    mockTest.averageScore = Math.round(totalScore / mockTest.totalAttempts);

    await mockTest.save();

    // Update user's mock test results
    const user = await User.findById(userId);
    user.mocktestResults.push({
      testId: mockTest._id,
      score: score,
      maxScore: maxScore,
      percentage: percentage,
      passed: passed,
      takenAt: new Date(),
    });

    await user.save();

    // Return detailed results
    const response = {
      success: true,
      results: {
        testId: mockTest._id,
        testTitle: mockTest.title,
        score: score,
        maxScore: maxScore,
        percentage: percentage,
        passed: passed,
        passingScore: mockTest.passingScore,
        timeSpent: timeSpent || 0,
        totalQuestions: mockTest.questions.length,
        correctAnswers: results.filter(r => r.isCorrect).length,
        submittedAt: new Date(),
        questions: results,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error submitting mock test:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's mock test results
// @route   GET /api/mock-tests/my-results
// @access  Private (Student)
const getUserMockTestResults = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate({
        path: "mocktestResults.testId",
        select: "title description courseId createdBy",
        populate: {
          path: "courseId",
          select: "title"
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      results: user.mocktestResults.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))
    });
  } catch (error) {
    console.error("Error fetching user mock test results:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get mock test results for mentor (all attempts)
// @route   GET /api/mocktests/:id/results
// @access  Private (Mentor only)
const getMockTestResults = async (req, res) => {
  try {
    const mockTest = await MockTest.findById(req.params.id)
      .populate("attempts.userId", "firstName lastName email")
      .populate("courseId", "title");

    if (!mockTest) {
      return res.status(404).json({ message: "Mock test not found" });
    }

    // Check if the mentor is the creator
    if (!mockTest.createdBy.equals(req.mentor._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access these results" });
    }

    const statistics = {
      totalAttempts: mockTest.totalAttempts,
      averageScore: mockTest.averageScore,
      passRate: mockTest.attempts.length > 0 
        ? Math.round((mockTest.attempts.filter(a => a.percentage >= mockTest.passingScore).length / mockTest.attempts.length) * 100)
        : 0,
      highestScore: mockTest.attempts.length > 0 
        ? Math.max(...mockTest.attempts.map(a => a.percentage))
        : 0,
      lowestScore: mockTest.attempts.length > 0 
        ? Math.min(...mockTest.attempts.map(a => a.percentage))
        : 0,
    };

    const results = {
      testInfo: {
        _id: mockTest._id,
        title: mockTest.title,
        description: mockTest.description,
        courseId: mockTest.courseId,
        totalQuestions: mockTest.questions.length,
        passingScore: mockTest.passingScore,
        timeLimit: mockTest.timeLimit,
      },
      statistics: statistics,
      attempts: mockTest.attempts.map(attempt => ({
        _id: attempt._id,
        student: attempt.userId,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        passed: attempt.percentage >= mockTest.passingScore,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt,
      })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    };

    res.json(results);
  } catch (error) {
    console.error("Error fetching mock test results:", error);
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
  startMockTest,
  submitMockTest,
  getUserMockTestResults,
  getMockTestResults,
  getMockTestsByCategory,
  getMockTestsByMentor,
  getMentorMockTests,
};
