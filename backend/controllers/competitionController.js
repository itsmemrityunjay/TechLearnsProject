const Competition = require("../models/competitionModel");
const User = require("../models/userModel");
const Mentor = require("../models/mentorModel");
const mongoose = require("mongoose");

// @desc    Create a new competition
// @route   POST /api/competitions
// @access  Private
const createCompetition = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      rules,
      prizes,
      category,
      difficulty,
      maxParticipants,
      thumbnail,
      competitionType,
      // New fields
      eligibilityCriteria,
      evaluationCriteria,
      timeline,
      // External competition fields
      venue,
      organizer,
      registrationDeadline,
      externalLink,
    } = req.body;

    // Determine host model based on role
    let hostModel;
    let hostedBy;

    if (req.role === "mentor") {
      hostModel = "Mentor";
      hostedBy = req.mentor._id;
    } else if (req.role === "user") {
      hostModel = "User";
      hostedBy = req.user._id;
    } else if (req.role === "school") {
      hostModel = "School";
      hostedBy = req.school._id;
    }

    const competition = await Competition.create({
      title,
      description,
      startDate,
      endDate,
      hostedBy,
      hostModel,
      rules,
      prizes,
      category,
      difficulty,
      maxParticipants,
      thumbnail,
      competitionType,
      // New fields
      eligibilityCriteria,
      evaluationCriteria,
      timeline,
      // External competition fields
      venue,
      organizer,
      registrationDeadline,
      externalLink,
    });

    if (competition) {
      // If user is hosting, add to competitionsHosted
      if (req.role === "user") {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { competitionsHosted: competition._id },
        });
      } else if (req.role === "mentor") {
        await Mentor.findByIdAndUpdate(req.mentor._id, {
          $push: { "competitions.hosted": competition._id },
        });
      }

      res.status(201).json(competition);
    } else {
      res.status(400).json({ message: "Invalid competition data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all competitions
// @route   GET /api/competitions
// @access  Public
const getCompetitions = async (req, res) => {
  try {
    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      console.error("Database not connected, readyState:", mongoose.connection.readyState);
      return res.status(500).json({ 
        message: "Database connection issue",
        readyState: mongoose.connection.readyState
      });
    }

    // Parse query parameters
    const { category, status, difficulty } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (difficulty) query.difficulty = difficulty;

    // Get competitions without population first to isolate issues
    const competitions = await Competition.find(query).sort({ startDate: -1 });
    
    // Then populate if needed
    const populatedCompetitions = await Competition.populate(competitions, {
      path: "hostedBy",
      select: "name firstName lastName organizationName"
    });

    res.json(populatedCompetitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ 
      message: "Failed to fetch competitions", 
      error: error.message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack 
    });
  }
};

// @desc    Get competition by ID
// @route   GET /api/competitions/:id
// @access  Public
const getCompetitionById = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate({
        path: "hostedBy",
        select: "name firstName lastName organizationName profileImage",
      })
      .populate({
        path: "participants.userId",
        select: "firstName lastName profileImage",
      });

    if (competition) {
      res.json(competition);
    } else {
      res.status(404).json({ message: "Competition not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update competition
// @route   PUT /api/competitions/:id
// @access  Private
const updateCompetition = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      rules,
      prizes,
      category,
      difficulty,
      maxParticipants,
      thumbnail,
      competitionType,
      // New fields
      eligibilityCriteria,
      evaluationCriteria,
      timeline,
      // External competition fields
      venue,
      organizer,
      registrationDeadline,
      externalLink,
    } = req.body;

    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if user is authorized to update
    const isHost =
      (competition.hostModel === "User" &&
        req.user &&
        competition.hostedBy.equals(req.user._id)) ||
      (competition.hostModel === "Mentor" &&
        req.mentor &&
        competition.hostedBy.equals(req.mentor._id)) ||
      (competition.hostModel === "School" &&
        req.school &&
        competition.hostedBy.equals(req.school._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!isHost && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this competition" });
    }

    // Update fields
    competition.title = title || competition.title;
    competition.description = description || competition.description;
    competition.startDate = startDate || competition.startDate;
    competition.endDate = endDate || competition.endDate;
    competition.rules = rules || competition.rules;
    competition.prizes = prizes || competition.prizes;
    competition.category = category || competition.category;
    competition.difficulty = difficulty || competition.difficulty;
    competition.maxParticipants =
      maxParticipants || competition.maxParticipants;
    competition.thumbnail = thumbnail || competition.thumbnail;
    competition.competitionType =
      competitionType || competition.competitionType;

    // New fields
    if (eligibilityCriteria)
      competition.eligibilityCriteria = eligibilityCriteria;
    if (evaluationCriteria) competition.evaluationCriteria = evaluationCriteria;
    if (timeline) competition.timeline = timeline;

    // External competition fields
    if (venue) competition.venue = venue;
    if (organizer) competition.organizer = organizer;
    if (registrationDeadline)
      competition.registrationDeadline = registrationDeadline;
    if (externalLink) competition.externalLink = externalLink;

    const updatedCompetition = await competition.save();
    res.json(updatedCompetition);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete competition
// @route   DELETE /api/competitions/:id
// @access  Private
const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if user is authorized to delete
    const isHost =
      (competition.hostModel === "User" &&
        req.user &&
        competition.hostedBy.equals(req.user._id)) ||
      (competition.hostModel === "Mentor" &&
        req.mentor &&
        competition.hostedBy.equals(req.mentor._id)) ||
      (competition.hostModel === "School" &&
        req.school &&
        competition.hostedBy.equals(req.school._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!isHost && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this competition" });
    }

    // Remove competition from host's competitions list
    if (competition.hostModel === "User") {
      await User.findByIdAndUpdate(competition.hostedBy, {
        $pull: { competitionsHosted: competition._id },
      });
    } else if (competition.hostModel === "Mentor") {
      await Mentor.findByIdAndUpdate(competition.hostedBy, {
        $pull: { "competitions.hosted": competition._id },
      });
    }

    // Remove competition from participants' lists
    for (const participant of competition.participants) {
      await User.findByIdAndUpdate(participant.userId, {
        $pull: {
          competitionsParticipated: {
            competitionId: competition._id,
          },
        },
      });
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ message: "Competition removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Register for competition
// @route   POST /api/competitions/:id/register
// @access  Private
const registerForCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if competition registration is open
    const now = new Date();
    if (now >= competition.startDate) {
      return res.status(400).json({
        message: "Registration closed. Competition has already started.",
      });
    }

    // Check if max participants reached
    if (
      competition.maxParticipants &&
      competition.participants.length >= competition.maxParticipants
    ) {
      return res
        .status(400)
        .json({ message: "Maximum number of participants reached" });
    }

    // Check if user is already registered
    const isRegistered = competition.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (isRegistered) {
      return res
        .status(400)
        .json({ message: "Already registered for this competition" });
    }

    // Register user
    const newParticipant = {
      userId: req.user._id,
      registeredAt: Date.now(),
    };

    competition.participants.push(newParticipant);
    await competition.save();

    // Add to user's competitions participated
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        competitionsParticipated: {
          competitionId: competition._id,
          participatedAt: Date.now(),
        },
      },
    });

    res
      .status(201)
      .json({ message: "Successfully registered for competition" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Submit competition entry
// @route   POST /api/competitions/:id/submit
// @access  Private
const submitCompetitionEntry = async (req, res) => {
  try {
    const { submissionUrl } = req.body;
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if competition is active
    const now = new Date();
    if (now < competition.startDate || now > competition.endDate) {
      return res.status(400).json({
        message:
          now < competition.startDate
            ? "Competition has not started yet"
            : "Competition has already ended",
      });
    }

    // Check if user is registered
    const participantIndex = competition.participants.findIndex(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res
        .status(400)
        .json({ message: "Not registered for this competition" });
    }

    // Update submission
    competition.participants[participantIndex].submissionUrl = submissionUrl;
    await competition.save();

    res.json({ message: "Submission successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update competition status
// @route   PUT /api/competitions/:id/status
// @access  Private
const updateCompetitionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if user is authorized to update status
    const isHost =
      (competition.hostModel === "User" &&
        req.user &&
        competition.hostedBy.equals(req.user._id)) ||
      (competition.hostModel === "Mentor" &&
        req.mentor &&
        competition.hostedBy.equals(req.mentor._id)) ||
      (competition.hostModel === "School" &&
        req.school &&
        competition.hostedBy.equals(req.school._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!isHost && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this competition" });
    }

    competition.status = status;
    await competition.save();

    res.json({ message: `Competition status updated to ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get competition participants
// @route   GET /api/competitions/:id/participants
// @access  Private
const getCompetitionParticipants = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id).populate({
      path: "participants.userId",
      select: "firstName lastName email profileImage",
    });

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if user is authorized to view participants
    const isHost =
      (competition.hostModel === "User" &&
        req.user &&
        competition.hostedBy.equals(req.user._id)) ||
      (competition.hostModel === "Mentor" &&
        req.mentor &&
        competition.hostedBy.equals(req.mentor._id)) ||
      (competition.hostModel === "School" &&
        req.school &&
        competition.hostedBy.equals(req.school._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!isHost && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view participants" });
    }

    res.json(competition.participants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Announce competition results
// @route   POST /api/competitions/:id/results
// @access  Private
const announceResults = async (req, res) => {
  try {
    const { results } = req.body; // Array of {userId, score, rank}
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    // Check if user is authorized to announce results
    const isHost =
      (competition.hostModel === "User" &&
        req.user &&
        competition.hostedBy.equals(req.user._id)) ||
      (competition.hostModel === "Mentor" &&
        req.mentor &&
        competition.hostedBy.equals(req.mentor._id)) ||
      (competition.hostModel === "School" &&
        req.school &&
        competition.hostedBy.equals(req.school._id));

    const isAdmin = req.user && req.user.role === "admin";

    if (!isHost && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to announce results" });
    }

    // Check if competition has ended
    const now = new Date();
    if (now < competition.endDate) {
      return res
        .status(400)
        .json({ message: "Cannot announce results before competition ends" });
    }

    // Update participant scores and ranks
    for (const result of results) {
      const participantIndex = competition.participants.findIndex(
        (p) => p.userId.toString() === result.userId
      );

      if (participantIndex !== -1) {
        competition.participants[participantIndex].score = result.score;
        competition.participants[participantIndex].rank = result.rank;

        // Update user's competition record
        await User.updateOne(
          {
            _id: result.userId,
            "competitionsParticipated.competitionId": competition._id,
          },
          {
            $set: {
              "competitionsParticipated.$.score": result.score,
              "competitionsParticipated.$.position": result.rank,
            },
          }
        );
      }
    }

    // Update competition status to completed
    competition.status = "completed";
    await competition.save();

    res.json({ message: "Competition results announced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCompetition,
  getCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  submitCompetitionEntry,
  updateCompetitionStatus,
  getCompetitionParticipants,
  announceResults,
};
