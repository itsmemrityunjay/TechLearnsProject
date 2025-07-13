const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      default: 30, // 30 minutes by default
    },
    passingScore: {
      type: Number,
      required: true,
      default: 70, // 70% by default
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
          validate: [(val) => val.length === 4, "Must have exactly 4 options"],
        },
        correctAnswer: {
          type: Number,
          required: true,
          min: 0,
          max: 3,
        },
        explanation: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MockTest = mongoose.model("MockTest", mockTestSchema);

module.exports = MockTest;
