const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/auth");
const { google } = require("googleapis");

// Configure multer to use memory storage for Vercel
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Google Drive API setup with better error handling
let drive;
try {
  const SCOPES = ['https://www.googleapis.com/auth/drive'];
  let auth;
  
  // Log the environment for debugging
  console.log(`Running in ${process.env.NODE_ENV || 'development'} environment`);
  
  // Check for Google service account in environment variable
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        auth = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: SCOPES,
        });
        console.log("✅ Initialized Google Drive with service account from env variables");
      } else {
        console.error("❌ GOOGLE_SERVICE_ACCOUNT missing private_key");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse GOOGLE_SERVICE_ACCOUNT:", parseError.message);
    }
  } else {
    console.warn("⚠️ GOOGLE_SERVICE_ACCOUNT env variable not found");
    
    // Try local file as fallback (for development)
    const KEYFILEPATH = path.join(__dirname, '../service.json');
    if (fs.existsSync(KEYFILEPATH)) {
      auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
      });
      console.log("✅ Initialized Google Drive with service account from local file");
    } else {
      console.warn(`⚠️ Service account file not found at ${KEYFILEPATH}`);
    }
  }
  
  if (auth) {
    drive = google.drive({ version: 'v3', auth });
    console.log("✅ Google Drive client created successfully");
  }
} catch (error) {
  console.error("❌ Failed to initialize Google Drive API:", error);
}

// Simple fallback for folder structure (if Drive fails)
const defaultFolders = {
  mainFolder: { id: 'root', name: 'TechLearns' },
  userFolder: { id: 'root', name: 'user' },
  subfolders: { 
    image: { id: 'root', name: 'images' },
    video: { id: 'root', name: 'videos' },
    application: { id: 'root', name: 'documents' }
  }
};

/**
 * Find a folder by name under a specific parent
 */
async function findFolder(name, parentId = null) {
  try {
    if (!drive) return null;
    
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
    if (!drive) return null;
    
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
    return null;
  }
}

/**
 * Create or retrieve folder structure for organizing uploads
 */
async function createFolderStructure(mainFolderName, userId, subfolders = []) {
  try {
    if (!drive) return defaultFolders;
    
    // Main folder
    let mainFolder = await findFolder(mainFolderName);
    if (!mainFolder) {
      mainFolder = await createFolder(mainFolderName);
      if (!mainFolder) return defaultFolders;
    }
    
    // User-specific folder inside the main folder
    let userFolder = await findFolder(userId, mainFolder.id);
    if (!userFolder) {
      userFolder = await createFolder(userId, mainFolder.id);
      if (!userFolder) return { mainFolder, userFolder: defaultFolders.userFolder, subfolders: {} };
    }
    
    // Create subfolders inside the user folder
    const createdSubfolders = {};
    for (const subfolderName of subfolders) {
      let subfolder = await findFolder(subfolderName, userFolder.id);
      if (!subfolder) {
        subfolder = await createFolder(subfolderName, userFolder.id);
        if (!subfolder) {
          createdSubfolders[subfolderName] = defaultFolders.subfolders[subfolderName] || { id: 'root', name: subfolderName };
          continue;
        }
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
    return defaultFolders;
  }
}

/**
 * Upload a file to Google Drive or fallback to base64
 */
async function uploadFile(fileBuffer, fileName, mimeType, destinationFolderId, options = {}) {
  try {
    if (!drive) throw new Error("Drive API not initialized");
    
    const { userId, category, customPrefix } = options;
    
    // Create timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '').slice(0, 14);
    
    // Extract file extension
    const fileExt = path.extname(fileName);
    const fileNameWithoutExt = path.basename(fileName, fileExt);
    
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
    
    const fileMetadata = {
      name: newFileName,
      parents: [destinationFolderId],
    };
    
    const media = {
      mimeType,
      body: Buffer.isBuffer(fileBuffer) 
        ? require('stream').Readable.from(fileBuffer)
        : fileBuffer
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
      originalName: fileName,
      fileId,
      fileUrl,
    };
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
}

// Upload endpoint using Google Drive with robust error handling
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Always log information about the upload
    console.log("File upload request:", {
      userId: req.userId,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // If Google Drive is not configured, fall back to base64 encoding
    if (!drive) {
      console.log("Using base64 fallback for file upload");
      const base64File = req.file.buffer.toString("base64");
      
      return res.json({
        message: "File uploaded successfully (using fallback base64 storage)",
        url: `data:${req.file.mimetype};base64,${base64File}`,
        fileUrl: `data:${req.file.mimetype};base64,${base64File}`,
        filename: req.file.originalname,
        size: req.file.size,
      });
    }
    
    // Determine file type category and create folder structure
    const fileType = req.file.mimetype.split('/')[0]; // 'image', 'video', 'application', etc.
    const userId = req.userId; // From auth middleware
    
    console.log(`Creating folder structure: TechLearns/${userId}/${fileType}`);
    const folderStructure = await createFolderStructure('TechLearns', userId, [fileType]);
    const targetFolderId = folderStructure.subfolders[fileType]?.id || 'root';
    
    // Upload to Google Drive
    console.log(`Uploading file to folder ID: ${targetFolderId}`);
    const fileUploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      targetFolderId,
      {
        userId,
        category: fileType,
        customPrefix: req.file.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
      }
    );
    
    console.log("Upload successful:", fileUploadResult);
    
    // Return consistent response format
    res.json({
      message: "File uploaded successfully to Google Drive",
      url: fileUploadResult.fileUrl,
      fileUrl: fileUploadResult.fileUrl, // Include both formats for compatibility
      filename: req.file.originalname,
      driveFilename: fileUploadResult.fileName,
      fileId: fileUploadResult.fileId,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    
    // Fallback to base64 if Google Drive upload fails
    try {
      if (req.file && req.file.buffer) {
        console.log("Using base64 fallback after error");
        const base64File = req.file.buffer.toString("base64");
        
        return res.json({
          message: "File uploaded with fallback method (Google Drive failed)",
          url: `data:${req.file.mimetype};base64,${base64File}`,
          fileUrl: `data:${req.file.mimetype};base64,${base64File}`,
          filename: req.file.originalname,
          size: req.file.size,
          note: "Used base64 fallback due to storage service error"
        });
      }
    } catch (fallbackError) {
      console.error("Even fallback failed:", fallbackError);
    }
    
    res.status(500).json({ 
      message: "Upload failed", 
      error: error.message 
    });
  }
});

module.exports = router;
