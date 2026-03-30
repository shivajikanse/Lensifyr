import { validationResult } from "express-validator";
import axios from "axios";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/cloudinary.config.js";
import {
  generateEmbeddingsFromBase64,
  generateEmbeddingsFromUrl,
} from "../service/pythonIntegration.service.js";
import {
  storeImageWithEmbeddings,
  getEventImages,
  deleteImageFromDatabase,
} from "../service/image.service.js";
import { findSimilarImages } from "../utils/similarity.js";
import {
  validateImageFile,
  generateZipFromImages,
  deleteFile,
  getReadableFileSize,
} from "../utils/imageUtils.js";
import ImageModel from "../models/image.model.js";
import eventModel from "../models/event.model.js";
import path from "path";
import os from "os";

//get a single file object
const normalizeUploadedFile = (file) => {
  if (Array.isArray(file)) {
    return file[0];
  }
  if (file && typeof file === "object" && "0" in file) {
    return file[0];
  }
  return file;
};

/**
 * Upload image to event (Organizer)
 * POST /api/image/upload
 */
export const uploadEventImage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { eventId } = req.body;
  const file = normalizeUploadedFile(req.files?.image);

  try {
    // Debug: Check if file exists
    if (!file) {
      console.error("No file provided in request.files.image");
      return res.status(400).json({ message: "No file provided" });
    }

    console.log("File object exists. Logging details...");
    // Verify event belongs to organizer
    const event = await eventModel.findOne({
      _id: eventId,
      organizer: req.organizer._id,
    });

    if (!event) {
      return res.status(404).json({
        message:
          "Event not found or you do not have permission to upload images",
      });
    }

    // Debug: log file details
    console.log("File upload details:", {
      name: file.name,
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      encoding: file.encoding,
      keys: Object.keys(file).filter((k) => k !== "data"), // Log all properties except data
    });

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      console.error("File validation failed:", validation.error);
      return res.status(400).json({ message: validation.error });
    }

    // Generate base64 for embeddings (using original buffer for accuracy)
    const base64Image = `data:${file.mimetype};base64,${file.data.toString("base64")}`;

    // Upload to Cloudinary with base64 data
    const cloudinaryResult = await uploadImageToCloudinary(
      base64Image,
      `event_${eventId}_${Date.now()}`,
      `lensifyr/events/${eventId}`,
    );

    // Generate embeddings using base64 (direct approach to avoid network issues)
    const embeddingResult = await generateEmbeddingsFromBase64(base64Image);

    // Store in MongoDB with embeddings
    const imageData = {
      eventId,
      organizerId: req.organizer._id,
      imageUrl: cloudinaryResult.imageUrl,
      publicId: cloudinaryResult.publicId,
      embeddings: embeddingResult.embeddings,
      faceCount: embeddingResult.faceCount,
      uploadedBy: "organizer",
    };

    const savedImage = await storeImageWithEmbeddings(imageData);

    return res.status(201).json({
      message: `Image uploaded successfully with ${embeddingResult.faceCount} face(s) detected`,
      image: {
        imageId: savedImage._id,
        imageUrl: savedImage.imageUrl,
        faceCount: savedImage.faceCount,
        uploadedAt: savedImage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    // Clean up Cloudinary image if upload succeeded but later processing failed
    if (cloudinaryResult?.publicId) {
      try {
        await deleteImageFromCloudinary(cloudinaryResult.publicId);
      } catch (deleteError) {
        console.error("Failed to clean up Cloudinary image:", deleteError);
      }
    }

    const statusCode = error.message.includes("not available") ? 503 : 500;
    return res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Upload selfie and get matched images (User)
 * Calls Python microservice for vectorized cosine similarity computation
 * POST /api/image/find-matches
 */
export const findMatchedImages = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { eventId, similarity_threshold = 0.4 } = req.body;
  const file = normalizeUploadedFile(req.files?.selfie);

  let zipFilePath = null;

  try {
    // Verify event exists and is active
    const event = await eventModel.findOne({
      _id: eventId,
      isActive: true,
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or is not active",
      });
    }

    // Validate similarity threshold
    if (
      typeof similarity_threshold !== "number" ||
      similarity_threshold < 0 ||
      similarity_threshold > 1
    ) {
      return res.status(400).json({
        message: "Similarity threshold must be between 0 and 1",
      });
    }

    // Validate file
    if (!file) {
      return res.status(400).json({ message: "No selfie file provided" });
    }

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    console.log("Step 1: Generating selfie embedding from user's image...");

    // Step 1: Generate embedding from user's selfie
    const base64Image = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    const embeddingResult = await generateEmbeddingsFromBase64(base64Image);

    if (
      !embeddingResult.embeddings ||
      embeddingResult.embeddings.length === 0
    ) {
      return res.status(400).json({
        message: "No faces detected in selfie",
      });
    }

    const selfieEmbedding = embeddingResult.embeddings[0]; // Use first face
    console.log(
      `Selfie embedding generated: ${selfieEmbedding.length}D vector`,
    );

    console.log("Step 2: Fetching all event image embeddings from MongoDB...");

    // Step 2: Fetch all event embeddings from MongoDB (only _id and faceEmbeddings)
    const eventImages = await ImageModel.find(
      { event: eventId, isProcessed: true },
      "faceEmbeddings -_id",
    ).lean();

    if (eventImages.length === 0) {
      return res.status(200).json({
        message: "No processed images found in this event",
        matches: [],
        matchCount: 0,
      });
    }

    // Flatten embeddings with image IDs for Python service
    const eventEmbeddings = [];
    eventImages.forEach((imgDoc) => {
      if (imgDoc.faceEmbeddings && Array.isArray(imgDoc.faceEmbeddings)) {
        imgDoc.faceEmbeddings.forEach((embedding, idx) => {
          eventEmbeddings.push({
            id: `${imgDoc._id}_face_${idx}`,
            embedding: embedding,
          });
        });
      }
    });

    if (eventEmbeddings.length === 0) {
      return res.status(200).json({
        message: "No face embeddings found in event images",
        matches: [],
        matchCount: 0,
      });
    }

    console.log(
      `Step 3: Calling Python microservice for vectorized similarity (${eventEmbeddings.length} embeddings)...`,
    );

    // Step 3: Call Python microservice for vectorized cosine similarity
    const pythonServiceUrl =
      process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
    const matchResponse = await axios.post(
      `${pythonServiceUrl}/api/find-matches`,
      {
        selfie_embedding: selfieEmbedding,
        event_embeddings: eventEmbeddings,
        threshold: similarity_threshold,
      },
      {
        timeout: 30000,
      },
    );

    const matches = matchResponse.data.matches;
    console.log(
      `Python service returned ${matches.length} matches in ${matchResponse.data.processing_time}ms`,
    );

    if (matches.length === 0) {
      return res.status(200).json({
        message: "No matching photos found above threshold",
        matches: [],
        matchCount: 0,
      });
    }

    // Step 4: Fetch full image documents from MongoDB
    console.log("Step 4: Fetching full image documents for matched images...");

    const imageIds = matches.map((m) => m.id.split("_face_")[0]);
    const fullImages = await ImageModel.find(
      { _id: { $in: imageIds } },
      "imageUrl publicId faceCount createdAt",
    ).lean();

    // Create map for quick lookup
    const imageMap = new Map(
      fullImages.map((img) => [img._id.toString(), img]),
    );

    // Enrich matches with full image data
    const enrichedMatches = matches
      .map((match) => {
        const imageId = match.id.split("_face_")[0];
        const imageDoc = imageMap.get(imageId);
        if (!imageDoc) return null;

        return {
          imageId: imageId,
          imageUrl: imageDoc.imageUrl,
          similarity: match.score,
          faceCount: imageDoc.faceCount,
          uploadedAt: imageDoc.createdAt,
        };
      })
      .filter((m) => m !== null);

    console.log(
      `Step 5: Generating ZIP file with ${enrichedMatches.length} matched images...`,
    );

    // Step 5: Generate ZIP file
    zipFilePath = path.join(os.tmpdir(), `matched_photos_${Date.now()}.zip`);
    await generateZipFromImages(enrichedMatches, zipFilePath);

    // Send ZIP file
    return res.download(zipFilePath, "matched_photos.zip", (err) => {
      // Clean up temporary ZIP file after sending
      if (zipFilePath) {
        deleteFile(zipFilePath).catch((error) => {
          console.error("Failed to clean up temporary file:", error);
        });
      }

      if (err) {
        console.error("Error sending ZIP file:", err);
      }
    });
  } catch (error) {
    console.error("Error finding matches:", error);

    // Clean up temporary file on error
    if (zipFilePath) {
      deleteFile(zipFilePath).catch((err) => {
        console.error("Failed to clean up temporary file:", err);
      });
    }

    // Check if error is due to Python service being down
    let statusCode = 500;
    let message = error.message;

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.message?.includes("ECONNREFUSED")
    ) {
      statusCode = 503;
      message =
        "Face matching service is currently unavailable. Please try again later.";
      console.error("Python microservice is not responding");
    } else if (error.response?.status === 400) {
      statusCode = 400;
      message =
        error.response.data?.detail || "Invalid request to face service";
    }

    return res.status(statusCode).json({
      message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get match preview (without ZIP generation)
 * POST /api/image/preview-matches
 */
export const previewMatches = async (req, res) => {
  const { eventId, similarity_threshold = 0.4 } = req.body;
  const file = normalizeUploadedFile(req.files?.selfie);

  try {
    // Validate event
    const event = await eventModel.findOne({
      _id: eventId,
      isActive: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Debug: log file details
    console.log("Preview matches file upload details:", {
      name: file.name,
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      keys: Object.keys(file).filter((k) => k !== "data"),
    });

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      console.error(
        "File validation failed in previewMatches:",
        validation.error,
      );
      return res.status(400).json({ message: validation.error });
    }

    // Generate embeddings from user's selfie using base64
    const base64Image = file.data.toString("base64");
    const embeddingResult = await generateEmbeddingsFromBase64(base64Image);

    // Get event images
    const eventImages = await getEventImages(eventId);

    if (eventImages.length === 0) {
      return res.status(200).json({
        message: "No images in event",
        matches: [],
      });
    }

    // Find matches
    const allMatches = [];
    for (let i = 0; i < embeddingResult.embeddings.length; i++) {
      const userEmbedding = embeddingResult.embeddings[i];
      const matches = findSimilarImages(
        userEmbedding,
        eventImages,
        similarity_threshold,
      );
      allMatches.push(...matches);
    }

    // Remove duplicates
    const uniqueMatches = Array.from(
      allMatches
        .reduce((map, match) => {
          const key = `${match.imageId}-${match.faceIndex}`;
          const existing = map.get(key);
          if (!existing || match.similarity > existing.similarity) {
            map.set(key, match);
          }
          return map;
        }, new Map())
        .values(),
    );

    // Sort by similarity
    uniqueMatches.sort((a, b) => b.similarity - a.similarity);

    // Return preview (hide personal embedding data)
    return res.status(200).json({
      message: "Match preview",
      matchCount: uniqueMatches.length,
      matches: uniqueMatches.map((match) => ({
        imageUrl: match.imageUrl,
        similarity: match.similarity,
        uploadedAt: match.uploadedAt,
      })),
    });
  } catch (error) {
    console.error("Error previewing matches:", error);
    const statusCode = error.message.includes("not available") ? 503 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Delete image from event (Organizer only)
 * DELETE /api/image/delete/:imageId
 */
export const deleteEventImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    // Get image and verify organizer owns it
    const image = await ImageModel.findById(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Verify organizer owns the image
    if (image.organizer.toString() !== req.organizer._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to delete this image",
      });
    }

    // Delete from Cloudinary
    await deleteImageFromCloudinary(image.publicId);

    // Delete from MongoDB
    await deleteImageFromDatabase(imageId);

    return res.status(200).json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * Get event images list (with pagination)
 * GET /api/image/event/:eventId?page=1&pageSize=20
 */
export const getEventImagesList = async (req, res) => {
  const { eventId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;

  try {
    // Verify event exists
    const event = await eventModel.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get paginated images
    const images = await getEventImages(eventId, {
      skip: (page - 1) * pageSize,
      limit: pageSize,
    });

    const totalCount = await ImageModel.countDocuments({
      event: eventId,
      isProcessed: true,
    });

    return res.status(200).json({
      images: images.map((img) => ({
        id: img._id,
        imageUrl: img.imageUrl,
        faceCount: img.faceCount,
        uploadedAt: img.createdAt,
      })),
      pagination: {
        page,
        pageSize,
        total: totalCount,
        pages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error getting images list:", error);
    res.status(500).json({ message: error.message });
  }
};
