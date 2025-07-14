const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Authorization"],
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import models
require("./models/userModel");
require("./models/mentorModel");
require("./models/schoolModel");
require("./models/courseModel");
require("./models/topicModel");
require("./models/competitionModel");
require("./models/mockTestModel");
require("./models/notebookModel");

// MongoDB Connection with improved timeout handling
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/your_database_name",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Lower timeout to fail faster
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 10000, // Connection timeout
    }
  )
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    console.log(`Connected to host: ${mongoose.connection.host}`);
    console.log(`Database name: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    console.error("Connection state:", mongoose.connection.readyState);
    console.error("MongoDB URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    // Log only partial URI for security if it exists
    if (process.env.MONGODB_URI) {
      const uriParts = process.env.MONGODB_URI.split('@');
      if (uriParts.length > 1) {
        console.error("MongoDB URI pattern:", `mongodb+srv://****:****@${uriParts[1]}`);
      }
    }
  });

// Add connection event listeners
mongoose.connection.on('connecting', () => {
  console.log('Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Define routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const courseRoutes = require("./routes/courseRoutes");
const topicRoutes = require("./routes/topicRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const mockTestRoutes = require("./routes/mockTestRoutes");
const notebookRoutes = require("./routes/notebookRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
// const paymentRoutes = require("./routes/paymentRoutes"); // Add this with your other route imports

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/mock-tests", mockTestRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/mocktests", mockTestRoutes);
// app.use("/api/payments", paymentRoutes); // Add this with your other route uses

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Always listen on a port for platforms like Render
// while still supporting serverless environments
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Export for serverless environments like Vercel
module.exports = app;
