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
    meetingPassword: {
      type: String,
      trim: true,
    },
    maxStudents: {
      type: Number,
      default: 50,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    waitingList: [
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
    topics: [String],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringSchedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      daysOfWeek: [Number], // 0-6 for Sunday-Saturday
      endDate: Date,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Helper method to check if the class is upcoming
classSchema.methods.isUpcoming = function () {
  return new Date(this.startTime) > new Date();
};

// Helper method to check if the class is full
classSchema.methods.isFull = function () {
  return this.enrolledStudents.length >= this.maxStudents;
};

// Helper method to check if the class is currently live
classSchema.methods.isLive = function () {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

// Helper method to get available spots
classSchema.methods.getAvailableSpots = function () {
  return Math.max(0, this.maxStudents - this.enrolledStudents.length);
};

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
