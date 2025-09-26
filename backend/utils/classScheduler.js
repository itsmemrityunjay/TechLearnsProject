const mongoose = require("mongoose");
const User = require("../models/userModel");
const Class = require("../models/classModel");

// Helper function to send class reminders
const sendClassReminder = async (classId, reminderType) => {
  try {
    const classData = await Class.findById(classId)
      .populate('enrolledStudents', 'firstName lastName email')
      .populate('mentor', 'firstName lastName');

    if (!classData) {
      console.log(`Class ${classId} not found for reminder`);
      return;
    }

    const reminderMessage = generateReminderMessage(classData, reminderType);
    
    // Here you would typically send emails or push notifications
    // For now, we'll just log the reminder
    console.log(`Reminder for class ${classData.title}: ${reminderMessage}`);
    
    // In a production environment, you would create notification records
    // or send actual emails/push notifications here

    console.log(`Sent ${reminderType} reminder for class: ${classData.title}`);
  } catch (error) {
    console.error('Error sending class reminder:', error);
  }
};

// Generate reminder message based on type
const generateReminderMessage = (classData, reminderType) => {
  const mentorName = `${classData.mentor.firstName} ${classData.mentor.lastName}`;
  const startTime = new Date(classData.startTime).toLocaleString();
  
  switch (reminderType) {
    case '24hours':
      return `Your class "${classData.title}" with ${mentorName} is scheduled for tomorrow at ${startTime}. Don't forget to join!`;
    case '1hour':
      return `Your class "${classData.title}" with ${mentorName} starts in 1 hour at ${startTime}. Get ready!`;
    case '15minutes':
      return `Your class "${classData.title}" starts in 15 minutes! Join now: ${classData.meetingLink || 'Link will be provided'}`;
    case 'starting':
      return `Your class "${classData.title}" is starting now! Join the session: ${classData.meetingLink || 'Link will be provided'}`;
    default:
      return `Reminder about your upcoming class: ${classData.title}`;
  }
};

// Auto-update class status based on time
const updateClassStatuses = async () => {
  try {
    const now = new Date();
    
    // Update classes that should be live
    await Class.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gte: now },
        status: 'scheduled',
        isCancelled: false
      },
      { status: 'live' }
    );
    
    // Update classes that should be completed
    await Class.updateMany(
      {
        endTime: { $lt: now },
        status: { $in: ['scheduled', 'live'] },
        isCancelled: false
      },
      { status: 'completed' }
    );
    
    console.log('Class statuses updated successfully');
  } catch (error) {
    console.error('Error updating class statuses:', error);
  }
};

// Initialize schedulers using setInterval (basic implementation)
const initializeClassSchedulers = () => {
  // Update class statuses every 5 minutes
  setInterval(updateClassStatuses, 5 * 60 * 1000);
  
  console.log('Class schedulers initialized');
};

module.exports = {
  sendClassReminder,
  updateClassStatuses,
  initializeClassSchedulers
};