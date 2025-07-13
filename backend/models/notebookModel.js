const mongoose = require("mongoose");

const notebookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Notebook",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["user", "mentor", "school"],
      default: "user",
    },
    content: {
      type: String,
      required: true,
      default: "// Start coding here",
    },
    language: {
      type: String,
      required: true,
      default: "javascript",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastExecuted: {
      type: Date,
    },
    lastOutput: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notebook = mongoose.model("Notebook", notebookSchema);
module.exports = Notebook;
