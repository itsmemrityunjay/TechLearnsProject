const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const { google } = require("googleapis");

// Create temp directory for file uploads if it doesn't exist
const tempUploadDir = path.join(os.tmpdir(), 'techlearns-uploads');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Configure multer to use temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Fallback to memory storage if disk storage isn't possible
const memoryStorage = multer.memoryStorage();

// Configure upload with file size limit
const upload = multer({
  storage: process.env.NODE_ENV === 'production' ? memoryStorage : storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Google Drive API setup
let drive;
try {
  const SCOPES = ['https://www.googleapis.com/auth/drive'];
  let auth;
  
  if (process.env.NODE_ENV === 'production') {
    // Load credentials from environment variable for production
    if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: SCOPES,
      });
      console.log("Initialized Google Drive with service account from env variables");
    } else {
      console.warn("GOOGLE_SERVICE_ACCOUNT env variable not found");
    }
  } else {
    // Load credentials from a local file for development
    const KEYFILEPATH = path.join(__dirname, '../service.json');
    if (fs.existsSync(KEYFILEPATH)) {
      auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
      });
      console.log("Initialized Google Drive with service account from local file");
    } else {
      console.warn(`Service account file not found at ${KEYFILEPATH}`);
    }
  }
  
  if (auth) {
    drive = google.drive({ version: 'v3', auth });
  }
} catch (error) {
  console.error("Failed to initialize Google Drive API:", error);
}

/**
 * Find a folder by name under a specific parent
 */
async function findFolder(name, parentId = null) {
  try {
    let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }
    
    const res = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });
    
    return res.data.files && res.data.files.length > 0 ? res.data.files[0] : null;
  } catch (error) {
    console.error("Error finding folder:", error);
    return null;
  }
}

/**
 * Create a folder on Google Drive
 */
async function createFolder(name, parentId = null) {
  try {
    const fileMetadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId && { parents: [parentId] }),
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id, name',
    });
    
    return folder.data;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
}

/**
 * Create or retrieve folder structure for organizing uploads
 */
async function createFolderStructure(mainFolderName, userId, subfolders = []) {
  try {
    // Main folder
    let mainFolder = await findFolder(mainFolderName);
    if (!mainFolder) {
      mainFolder = await createFolder(mainFolderName);
    }
    
    // User-specific folder inside the main folder
    let userFolder = await findFolder(userId, mainFolder.id);
    if (!userFolder) {
      userFolder = await createFolder(userId, mainFolder.id);
    }
    
    // Create subfolders inside the user folder
    const createdSubfolders = {};
    for (const subfolderName of subfolders) {
      let subfolder = await findFolder(subfolderName, userFolder.id);
      if (!subfolder) {
        subfolder = await createFolder(subfolderName, userFolder.id);
      }
      createdSubfolders[subfolderName] = subfolder;
    }
    
    return {
      mainFolder,
      userFolder,
      subfolders: createdSubfolders,
    };
  } catch (error) {
    console.error("Error creating folder structure:", error);
    throw error;
  }
}

/**
 * Upload a file to a specific folder on Google Drive
 */
async function uploadFile(filePath, destinationFolderId, options = {}) {
  try {
    const { userId, category, customPrefix } = options;
    
    // Get original filename and split into name and extension
    const originalFileName = path.basename(filePath);
    const fileExt = path.extname(originalFileName);
    const fileNameWithoutExt = path.basename(originalFileName, fileExt);
    
    // Create timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    
    // Build new filename with context information
    let newFileName = '';
    
    if (userId) {
      newFileName += `${userId}_`;
    }
    
    if (category) {
      newFileName += `${category}_`;
    }
    
    if (customPrefix) {
      newFileName += `${customPrefix}_`;
    }
    
    // Add sanitized original name and timestamp
    newFileName += `${fileNameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '')}_${timestamp}${fileExt}`;
    
    // Check if file is a Buffer (from memory storage) or a file path
    let media;
    if (Buffer.isBuffer(filePath)) {
      media = {
        body: filePath
      };
    } else {
      media = {
        body: fs.createReadStream(filePath)
      };
    }
    
    const fileMetadata = {
      name: newFileName,
      parents: [destinationFolderId],
    };
    
    // Upload the file
    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id, name',
    });
    
    // Set permission to "anyone with the link can view"
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      }
    });
    
    // Get the shareable web link
    const getFile = await drive.files.get({
      fileId: file.data.id,
      fields: 'id, name, webContentLink, webViewLink',
      supportsAllDrives: true,
    });

    const fileId = file.data.id;
    const fileUrl = getFile.data.webContentLink || getFile.data.webViewLink;

    return {
      fileName: file.data.name,
      originalName: originalFileName,
      fileId,
      fileUrl,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Clean up temp files periodically
function cleanupTempFiles() {
  try {
    const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
    
    if (fs.existsSync(tempUploadDir)) {
      const now = Date.now();
      const files = fs.readdirSync(tempUploadDir);
      
      files.forEach(file => {
        const filePath = path.join(tempUploadDir, file);
        try {
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;
          
          if (fileAge > MAX_AGE_MS) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old temp file: ${file} (${Math.round(fileAge/1000/60)} min old)`);
          }
        } catch (err) {
          console.error(`Error checking/removing old file ${file}:`, err);
        }
      });
    }
  } catch (error) {
    console.error("Error during temp file cleanup:", error);
  }
}

// Run cleanup every 30 minutes
const cleanupInterval = setInterval(cleanupTempFiles, 30 * 60 * 1000);

// Upload endpoint using Google Drive
router.post("/", protect, upload.single("file"), async (req, res) => {
  const tempFile = req.file;
  let tempFilePath = null;
  
  try {
    if (!tempFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // If Google Drive is not configured, fall back to base64 encoding
    if (!drive) {
      const fileBuffer = tempFile.buffer || fs.readFileSync(tempFile.path);
      const base64File = fileBuffer.toString("base64");
      
      return res.json({
        message: "File uploaded successfully (using fallback base64 storage)",
        url: `data:${tempFile.mimetype};base64,${base64File}`,
        filename: tempFile.originalname,
        size: tempFile.size,
      });
    }
    
    // If we have a buffer from memory storage, save it to temp file for processing
    if (tempFile.buffer) {
      tempFilePath = path.join(tempUploadDir, `${uuidv4()}-${tempFile.originalname}`);
      fs.writeFileSync(tempFilePath, tempFile.buffer);
    } else {
      tempFilePath = tempFile.path;
    }
    
    // Determine file type category and create folder structure
    const fileType = tempFile.mimetype.split('/')[0]; // 'image', 'video', 'application', etc.
    const userId = req.userId; // From auth middleware
    
    const folderStructure = await createFolderStructure('TechLearns', userId, [fileType]);
    const targetFolderId = folderStructure.subfolders[fileType].id;
    
    // Upload to Google Drive
    const fileUploadResult = await uploadFile(tempFilePath, targetFolderId, {
      userId,
      category: fileType,
      customPrefix: tempFile.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
    });
    
    res.json({
      message: "File uploaded successfully to Google Drive",
      url: fileUploadResult.fileUrl,
      filename: tempFile.originalname,
      driveFilename: fileUploadResult.fileName,
      fileId: fileUploadResult.fileId,
      size: tempFile.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      message: "Upload failed", 
      error: error.message 
    });
  } finally {
    // Clean up the temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temp file:", unlinkError);
      }
    }
  }
});

module.exports = router;
