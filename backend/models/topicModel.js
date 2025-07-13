const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Topic title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Topic description is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "creatorModel",
    },
    creatorModel: {
      type: String,
      enum: ["User", "Mentor"],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    discussions: [
      {
        question: {
          content: String,
          askedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "discussions.question.askerModel",
          },
          askerModel: {
            type: String,
            enum: ["User", "Mentor"],
          },
          date: { type: Date, default: Date.now },
        },
        answers: [
          {
            content: String,
            answeredBy: {
              type: mongoose.Schema.Types.ObjectId,
              refPath: "discussions.answers.answererModel",
            },
            answererModel: {
              type: String,
              enum: ["User", "Mentor"],
            },
            date: { type: Date, default: Date.now },
            isAccepted: { type: Boolean, default: false },
            votes: { type: Number, default: 0 },
          },
        ],
      },
    ],
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "likedByModel",
      },
    ],
    likedByModel: {
      type: String,
      enum: ["User", "Mentor"],
    },
  },
  {
    timestamps: true,
  }
);

const Topic = mongoose.model("Topic", topicSchema);
module.exports = Topic;
