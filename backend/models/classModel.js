const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Class title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attendance: {
      type: Map,
      of: Boolean,
      default: {},
    },
    materials: [
      {
        title: String,
        fileUrl: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isCancelled: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to check if the class is upcoming
classSchema.methods.isUpcoming = function () {
  return new Date(this.startTime) > new Date();
};

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
