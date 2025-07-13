const mongoose = require("mongoose");

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Competition title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Competition description is required"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    hostedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "hostModel",
    },
    hostModel: {
      type: String,
      enum: ["User", "Mentor", "School"],
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        rank: Number,
        submissionUrl: String,
      },
    ],
    rules: [String],
    prizes: [
      {
        rank: Number,
        description: String,
        value: Number,
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "easy", "medium", "hard", "expert"],
      required: true,
    },
    maxParticipants: {
      type: Number,
    },
    thumbnail: {
      type: String,
    },
    externalLink: {
      type: String,
    },
    venue: {
      type: String,
    },
    organizer: {
      type: String,
    },
    registrationDeadline: {
      type: Date,
    },
    competitionType: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    // New fields
    eligibilityCriteria: [String],
    evaluationCriteria: [String],
    timeline: [
      {
        phase: String,
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Competition = mongoose.model("Competition", competitionSchema);
module.exports = Competition;
