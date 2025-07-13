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

// MongoDB Connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/your_database_name",
    {}
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
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
