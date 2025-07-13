const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },
    schoolOrganizationName: {
      type: String,
      trim: true,
    },
    education: {
      level: String,
      institution: String,
      year: Number,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    streak: {
      type: Number,
      default: 0,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    notebooks: [
      {
        title: String,
        content: String,
        language: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    competitionsParticipated: [
      {
        competitionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Competition",
        },
        position: Number,
        score: Number,
        participatedAt: { type: Date, default: Date.now },
      },
    ],
    competitionsHosted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Competition",
      },
    ],
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    registeredCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrolledOn: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
      },
    ],
    badges: [
      {
        name: String,
        description: String,
        image: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    profileImage: {
      type: String,
    },
    thumbnailImage: {
      type: String,
    },
    belowPoverty: {
      status: {
        type: Boolean,
        default: false,
      },
      document: {
        type: String, // URL to uploaded document
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    mocktestResults: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MockTest",
        },
        score: Number,
        maxScore: Number,
        takenAt: { type: Date, default: Date.now },
      },
    ],
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dateOfBirth: {
      type: Date,
    },

    attendanceCount: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
