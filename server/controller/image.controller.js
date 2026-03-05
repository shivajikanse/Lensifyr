import { validationResult } from "express-validator";
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

    // Debug: log file details
    console.log("Face search file upload details:", {
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
        "File validation failed in searchFaceMatches:",
        validation.error,
      );
      return res.status(400).json({ message: validation.error });
    }

    // Generate embeddings from user's selfie using base64
    // Must include data URL prefix (same format as upload path)
    const base64Image = `data:${file.mimetype};base64,${file.data.toString("base64")}`;
    const embeddingResult = await generateEmbeddingsFromBase64(base64Image);

    console.log("Selfie embedding result:", {
      faceCount: embeddingResult.faceCount,
      embeddingDimensions: embeddingResult.embeddings.map((e) => e.length),
      firstEmbeddingSample: embeddingResult.embeddings[0]?.slice(0, 5),
    });

    // Get all event images
    const eventImages = await getEventImages(eventId);

    console.log("Event images found:", {
      count: eventImages.length,
      firstImageEmbeddingDim: eventImages[0]?.faceEmbeddings?.[0]?.length,
      firstImageEmbeddingSample: eventImages[0]?.faceEmbeddings?.[0]?.slice(
        0,
        5,
      ),
    });

    if (eventImages.length === 0) {
      return res.status(200).json({
        message: "No images found in this event",
        matches: [],
      });
    }

    // Find similar images for each face in the selfie
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

    // Remove duplicates (keep highest similarity score for each image)
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

    // If no matches, return early
    if (uniqueMatches.length === 0) {
      return res.status(200).json({
        message: "No matching photos found for this event",
        matches: [],
        matchCount: 0,
      });
    }

    // Generate ZIP file
    zipFilePath = path.join(os.tmpdir(), `matched_photos_${Date.now()}.zip`);

    await generateZipFromImages(uniqueMatches, zipFilePath);

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

    const statusCode = error.message.includes("not available") ? 503 : 500;
    return res.status(statusCode).json({
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
