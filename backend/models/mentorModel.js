const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const mentorSchema = new mongoose.Schema(
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
    availability: {
      days: [String],
      timeSlots: [
        {
          from: String,
          to: String,
        },
      ],
    },
    languages: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    about: {
      type: String,
      trim: true,
    },
    experience: [
      {
        organization: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        year: Number,
      },
    ],
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    courseUploader: {
      type: Boolean,
      default: false,
    },
    resumeCV: {
      type: String, // URL to CV/resume document
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],
    competitions: {
      participated: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Competition",
        },
      ],
      hosted: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Competition",
        },
      ],
    },
    profileImage: {
      type: String,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
mentorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Mentor = mongoose.model("Mentor", mentorSchema);
module.exports = Mentor;
