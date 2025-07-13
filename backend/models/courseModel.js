const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    courseFor: {
      type: String,
      required: true,
      enum: ["elementary", "undergraduate", "graduate", "professional"],
      default: "undergraduate",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
    },
    objectives: {
      type: [String],
      default: [],
    },
    content: [
      {
        title: String,
        description: String,
        type: {
          type: String,
          enum: ["lesson", "video", "quiz"],
          default: "lesson",
        },
        videoUrl: String,
        duration: String,
        textContent: String,
        attachments: [
          {
            name: String,
            url: String,
          },
        ],
      },
    ],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
