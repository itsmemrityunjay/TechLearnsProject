const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientType",
    },
    recipientType: {
      type: String,
      required: true,
      enum: ["user", "mentor", "school"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderType",
    },
    senderType: {
      type: String,
      enum: ["user", "mentor", "school", "system"],
      default: "system",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "new-enrollment",
        "course-update",
        "class-reminder",
        "message",
        "system",
        "achievement",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
