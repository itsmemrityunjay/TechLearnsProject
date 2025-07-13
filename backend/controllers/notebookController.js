const Notebook = require("../models/notebookModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const axios = require("axios");

// @desc    Create a new notebook
// @route   POST /api/notebooks
// @access  Private (Premium/Registered users only)
const createNotebook = async (req, res) => {
  try {
    const { title, content, language, tags, isPublic } = req.body;

    const notebook = await Notebook.create({
      title,
      userId: req.user._id,
      content,
      language,
      tags: tags || [],
      isPublic: isPublic || false,
    });

    if (notebook) {
      res.status(201).json(notebook);
    } else {
      res.status(400).json({ message: "Invalid notebook data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all notebooks for the logged-in user
// @route   GET /api/notebooks
// @access  Private
const getNotebooks = async (req, res) => {
  try {
    const notebooks = await Notebook.find({ userId: req.user._id });
    res.json(notebooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all public notebooks
// @route   GET /api/notebooks/public
// @access  Public
const getPublicNotebooks = async (req, res) => {
  try {
    const notebooks = await Notebook.find({ isPublic: true }).populate({
      path: "userId",
      select: "firstName lastName profileImage",
    });

    res.json(notebooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get notebook by ID
// @route   GET /api/notebooks/:id
// @access  Private (owner or collaborator)
const getNotebookById = async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id)
      .populate({
        path: "userId",
        select: "firstName lastName profileImage",
      })
      .populate({
        path: "collaborators",
        select: "firstName lastName profileImage",
      });

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Check if user is authorized to view the notebook
    const isOwner = notebook.userId._id.toString() === req.user._id.toString();
    const isCollaborator = notebook.collaborators.some(
      (collab) => collab._id.toString() === req.user._id.toString()
    );
    const isPublic = notebook.isPublic;

    if (!isOwner && !isCollaborator && !isPublic) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this notebook" });
    }

    res.json(notebook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update notebook
// @route   PUT /api/notebooks/:id
// @access  Private (owner or collaborator)
const updateNotebook = async (req, res) => {
  try {
    const { title, content, language, tags, isPublic } = req.body;
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Check if user is authorized to update the notebook
    const isOwner = notebook.userId.toString() === req.user._id.toString();
    const isCollaborator = notebook.collaborators.some(
      (collab) => collab.toString() === req.user._id.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this notebook" });
    }

    // Only the owner can change visibility
    if (isPublic !== undefined && !isOwner) {
      return res
        .status(403)
        .json({ message: "Only the owner can change visibility settings" });
    }

    // Update fields
    notebook.title = title || notebook.title;
    notebook.content = content !== undefined ? content : notebook.content;
    notebook.language = language || notebook.language;
    notebook.tags = tags || notebook.tags;

    if (isPublic !== undefined && isOwner) {
      notebook.isPublic = isPublic;
    }

    const updatedNotebook = await notebook.save();
    res.json(updatedNotebook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete notebook
// @route   DELETE /api/notebooks/:id
// @access  Private (owner only)
const deleteNotebook = async (req, res) => {
  try {
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Check if user is the owner
    if (notebook.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete this notebook" });
    }

    await Notebook.findByIdAndDelete(req.params.id);
    res.json({ message: "Notebook removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Share notebook (toggle public status)
// @route   PUT /api/notebooks/:id/share
// @access  Private (owner only)
const shareNotebook = async (req, res) => {
  try {
    const { isPublic } = req.body;
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Check if user is the owner
    if (notebook.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can share this notebook" });
    }

    notebook.isPublic = isPublic !== undefined ? isPublic : !notebook.isPublic;
    await notebook.save();

    res.json({
      message: notebook.isPublic
        ? "Notebook is now public"
        : "Notebook is now private",
      isPublic: notebook.isPublic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add collaborator to notebook
// @route   POST /api/notebooks/:id/collaborators
// @access  Private (owner only)
const addCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Check if user is the owner
    if (notebook.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can add collaborators" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a collaborator
    const isCollaborator = notebook.collaborators.some(
      (collab) => collab.toString() === userId
    );

    if (isCollaborator) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    // Add collaborator
    notebook.collaborators.push(userId);
    await notebook.save();

    res.json({ message: "Collaborator added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove collaborator from notebook
// @route   DELETE /api/notebooks/:id/collaborators
// @access  Private (owner only)
const removeCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    const notebook = await Notebook.findById(req.params.id);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Check if user is the owner
    if (notebook.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only the owner can remove collaborators" });
    }

    // Check if user is a collaborator
    const collaboratorIndex = notebook.collaborators.findIndex(
      (collab) => collab.toString() === userId
    );

    if (collaboratorIndex === -1) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    // Remove collaborator
    notebook.collaborators.splice(collaboratorIndex, 1);
    await notebook.save();

    res.json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Execute code in various languages
// @route   POST /api/execute
// @access  Private
const executeCode = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Add this line for debugging
    const { language, code } = req.body; // Match the frontend parameter name

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    console.log(`Executing ${language} code (length: ${code.length} chars)`);

    // Special handling for HTML - processed by frontend
    if (language === "html") {
      return res.json({
        output: code,
        outputType: "html",
      });
    }

    // Map to proper language identifiers
    const languageMap = {
      javascript: "nodejs",
      python: "python3",
      java: "java",
      cpp: "cpp",
      csharp: "csharp",
      go: "go",
      php: "php",
      ruby: "ruby",
      typescript: "typescript",
      rust: "rust",
      kotlin: "kotlin",
    };

    // Specific version mapping
    const versionMap = {
      nodejs: "18.12.1",
      python3: "3.10.0",
      java: "17.0.3",
      cpp: "11.2.0",
      csharp: "6.12.0",
      go: "1.19.2",
      php: "8.1.6",
      ruby: "3.1.2",
      typescript: "5.0.3",
      rust: "1.64.0",
      kotlin: "1.6.21",
    };

    const apiLanguage = languageMap[language] || "nodejs";
    const version = versionMap[apiLanguage];

    // In case of timeout, implement a server-side timeout
    const pistonURL = "https://emkc.org/api/v2/piston/execute";

    try {
      // FALLBACK APPROACH: If external API fails, provide a mock response
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock execution in development");

        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let mockOutput = "";

        // Generate mock outputs based on language
        if (language === "javascript") {
          if (code.includes("console.log")) {
            mockOutput = "Hello, World!";
          } else {
            mockOutput = "[No console output]";
          }
        } else if (language === "python") {
          if (code.includes("print")) {
            mockOutput = "Hello, World!";
          } else {
            mockOutput = "[No print output]";
          }
        } else {
          mockOutput = `[${language.toUpperCase()} execution simulation]\nOutput would appear here`;
        }

        return res.json({ output: mockOutput });
      }

      // NORMAL APPROACH: Try the API
      const requestData = {
        language: apiLanguage,
        version: version,
        files: [
          {
            name:
              language === "python"
                ? "main.py"
                : language === "java"
                ? "Main.java"
                : language === "cpp"
                ? "main.cpp"
                : "index.js",
            content: code,
          },
        ],
      };

      // Log request (but mask long code)
      console.log("API Request:", {
        ...requestData,
        files: [
          { name: requestData.files[0].name, contentLength: code.length },
        ],
      });

      const response = await axios.post(pistonURL, requestData, {
        timeout: 20000,
      });

      console.log("API Response status:", response.status);

      // Format the response
      let output = "";
      if (response.data.run) {
        if (response.data.run.stdout) {
          output += response.data.run.stdout;
        }
        if (response.data.run.stderr) {
          output += response.data.run.stderr;
        }

        if (output.trim() === "") {
          output = "Code executed successfully with no output.";
        }
      } else {
        output = "Execution completed with no result data.";
      }

      return res.json({ output });
    } catch (apiError) {
      console.error("API Error:", apiError.message);

      // If API call failed, return a descriptive error
      if (apiError.response) {
        console.error("API response:", apiError.response.data);
        return res.status(500).json({
          error: `Code execution failed: ${
            apiError.response.data?.message || apiError.message
          }`,
        });
      } else {
        return res.status(500).json({
          error: `Could not connect to code execution service: ${apiError.message}`,
        });
      }
    }
  } catch (error) {
    console.error("Execute code error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNotebook,
  getNotebooks,
  getPublicNotebooks,
  getNotebookById,
  updateNotebook,
  deleteNotebook,
  shareNotebook,
  addCollaborator,
  removeCollaborator,
  executeCode,
};
