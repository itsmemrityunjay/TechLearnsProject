const Topic = require("../models/topicModel");
const mongoose = require("mongoose");

// @desc    Create a new topic
// @route   POST /api/topics
// @access  Private
const createTopic = async (req, res) => {
  try {
    const { title, description, isPremium, tags, category } = req.body;

    // Determine creator model based on role
    let creatorModel = req.role === "mentor" ? "Mentor" : "User";
    let createdById = req.role === "mentor" ? req.mentor._id : req.user._id;

    const topic = await Topic.create({
      title,
      description,
      createdBy: createdById,
      creatorModel,
      isPremium,
      tags,
      category,
    });

    if (topic) {
      res.status(201).json(topic);
    } else {
      res.status(400).json({ message: "Invalid topic data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all topics
// @route   GET /api/topics
// @access  Public
const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({}).populate({
      path: "createdBy",
      select:
        req.query.creatorModel === "Mentor" ? "name" : "firstName lastName",
    });
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get topics by category
// @route   GET /api/topics/category/:category
// @access  Public
const getTopicsByCategory = async (req, res) => {
  try {
    const topics = await Topic.find({ category: req.params.category }).populate(
      {
        path: "createdBy",
        select: "name firstName lastName",
      }
    );
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get topic by ID
// @route   GET /api/topics/:id
// @access  Public
const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate({
        path: "createdBy",
        select: "name firstName lastName profileImage",
      })
      .populate({
        path: "discussions.question.askedBy",
        select: "name firstName lastName profileImage",
      })
      .populate({
        path: "discussions.answers.answeredBy",
        select: "name firstName lastName profileImage",
      });

    if (topic) {
      // Increment view count
      topic.views += 1;
      await topic.save();

      res.json(topic);
    } else {
      res.status(404).json({ message: "Topic not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Private
const updateTopic = async (req, res) => {
  try {
    const { title, description, isPremium, tags, category } = req.body;
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Check ownership
    const creatorIdMatch =
      (topic.creatorModel === "Mentor" &&
        req.mentor &&
        topic.createdBy.equals(req.mentor._id)) ||
      (topic.creatorModel === "User" &&
        req.user &&
        topic.createdBy.equals(req.user._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!creatorIdMatch && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this topic" });
    }

    topic.title = title || topic.title;
    topic.description = description || topic.description;
    topic.isPremium = isPremium !== undefined ? isPremium : topic.isPremium;
    topic.tags = tags || topic.tags;
    topic.category = category || topic.category;

    const updatedTopic = await topic.save();
    res.json(updatedTopic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Private
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Check ownership or admin
    const creatorIdMatch =
      (topic.creatorModel === "Mentor" &&
        req.mentor &&
        topic.createdBy.equals(req.mentor._id)) ||
      (topic.creatorModel === "User" &&
        req.user &&
        topic.createdBy.equals(req.user._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!creatorIdMatch && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this topic" });
    }

    await Topic.findByIdAndDelete(req.params.id);
    res.json({ message: "Topic removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add question to topic
// @route   POST /api/topics/:id/questions
// @access  Private
const addQuestion = async (req, res) => {
  try {
    const { content } = req.body;
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Determine asker model and ID based on role
    let askerModel = req.role === "mentor" ? "Mentor" : "User";
    let askedById = req.role === "mentor" ? req.mentor._id : req.user._id;

    const question = {
      question: {
        content,
        askedBy: askedById,
        askerModel,
        date: Date.now(),
      },
      answers: [],
    };

    topic.discussions.push(question);
    await topic.save();

    res.status(201).json(topic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add answer to question
// @route   POST /api/topics/:id/questions/:questionId/answers
// @access  Private
const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const questionIndex = topic.discussions.findIndex(
      (d) => d._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Determine answerer model and ID based on role
    let answererModel = req.role === "mentor" ? "Mentor" : "User";
    let answeredById = req.role === "mentor" ? req.mentor._id : req.user._id;

    const answer = {
      content,
      answeredBy: answeredById,
      answererModel,
      date: Date.now(),
      isAccepted: false,
      votes: 0,
    };

    topic.discussions[questionIndex].answers.push(answer);
    await topic.save();

    res.status(201).json(topic.discussions[questionIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Vote on answer
// @route   PUT /api/topics/:id/questions/:questionId/answers/:answerId/vote
// @access  Private
const voteAnswer = async (req, res) => {
  try {
    const { vote } = req.body; // 1 for upvote, -1 for downvote
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const question = topic.discussions.id(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Update vote count
    answer.votes += vote > 0 ? 1 : -1;

    await topic.save();
    res.json(answer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Accept answer
// @route   PUT /api/topics/:id/questions/:questionId/answers/:answerId/accept
// @access  Private
const acceptAnswer = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const questionIndex = topic.discussions.findIndex(
      (d) => d._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if user is the question asker
    const question = topic.discussions[questionIndex];
    const isQuestionAsker =
      (question.question.askerModel === "User" &&
        req.user &&
        question.question.askedBy.equals(req.user._id)) ||
      (question.question.askerModel === "Mentor" &&
        req.mentor &&
        question.question.askedBy.equals(req.mentor._id));

    if (!isQuestionAsker) {
      return res
        .status(403)
        .json({ message: "Only the question asker can accept an answer" });
    }

    // Find the answer
    const answerIndex = question.answers.findIndex(
      (a) => a._id.toString() === req.params.answerId
    );

    if (answerIndex === -1) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Reset all answers to not accepted
    question.answers.forEach((a) => {
      a.isAccepted = false;
    });

    // Set the selected answer as accepted
    question.answers[answerIndex].isAccepted = true;

    await topic.save();
    res.json(topic.discussions[questionIndex]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add like/unlike functions
const likeTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // If topic doesn't have likes field, initialize it
    if (!topic.likes) {
      topic.likes = 1;
    } else {
      topic.likes += 1;
    }

    // In a real app, you would also track which users liked to prevent duplicates
    // That would require updating your model to include a likedBy array

    await topic.save();
    res.json({ likes: topic.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const unlikeTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic.likes && topic.likes > 0) {
      topic.likes -= 1;
    }

    await topic.save();
    res.json({ likes: topic.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const bookmarkTopic = async (req, res) => {
  try {
    // This would typically store the bookmark in the user's profile
    // Since this is a simplified version, we'll just return success

    // In a real implementation you'd do something like:
    // await User.findByIdAndUpdate(req.user._id,
    //   { $addToSet: { bookmarks: req.params.id } });

    res.json({ success: true, message: "Topic bookmarked" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const unbookmarkTopic = async (req, res) => {
  try {
    // Similar to bookmark, but remove instead
    // await User.findByIdAndUpdate(req.user._id,
    //   { $pull: { bookmarks: req.params.id } });

    res.json({ success: true, message: "Topic unbookmarked" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Like a question/response
// @route   POST /api/topics/:id/questions/:questionId/like
// @access  Private
const likeQuestion = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const questionIndex = topic.discussions.findIndex(
      (d) => d._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ message: "Question not found" });
    }

    // If question doesn't have likes field, initialize it
    if (!topic.discussions[questionIndex].question.likes) {
      topic.discussions[questionIndex].question.likes = 0;
    }

    topic.discussions[questionIndex].question.likes += 1;

    // In a real app, you would also track which users liked to prevent duplicates
    // That would require updating your model to include a likedBy array

    await topic.save();
    res.json({ likes: topic.discussions[questionIndex].question.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Unlike a question/response
// @route   DELETE /api/topics/:id/questions/:questionId/like
// @access  Private
const unlikeQuestion = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const questionIndex = topic.discussions.findIndex(
      (d) => d._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (topic.discussions[questionIndex].question.likes > 0) {
      topic.discussions[questionIndex].question.likes -= 1;
    }

    await topic.save();
    res.json({ likes: topic.discussions[questionIndex].question.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  addQuestion,
  addAnswer,
  voteAnswer,
  acceptAnswer,
  getTopicsByCategory,
  likeTopic,
  unlikeTopic,
  bookmarkTopic,
  unbookmarkTopic,
  likeQuestion,
  unlikeQuestion,
};
