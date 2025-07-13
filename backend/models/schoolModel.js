const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    headName: {
      type: String,
      required: [true, "Head name is required"],
      trim: true,
    },
    headContactNumber: {
      type: String,
      required: [true, "Head contact number is required"],
    },
    headEmail: {
      type: String,
      required: [true, "Head email is required"],
      trim: true,
      lowercase: true,
    },
    organizationEmail: {
      type: String,
      required: [true, "Organization email is required"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    students: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        remarks: String,
        results: [
          {
            examName: String,
            score: Number,
            maxScore: Number,
            date: { type: Date },
          },
        ],
        attendance: {
          present: Number,
          total: Number,
          percentage: Number,
        },
      },
    ],
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    availableCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        enrollmentStatus: {
          type: String,
          enum: ["open", "closed", "coming-soon"],
          default: "open",
        },
      },
    ],
    logo: {
      type: String,
    },
    website: {
      type: String,
    },
    established: {
      type: Number,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const School = mongoose.model("School", schoolSchema);
module.exports = School;
