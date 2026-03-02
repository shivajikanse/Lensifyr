import ImageModel from "../models/image.model.js";
import { calculateMagnitude } from "../utils/similarity.js";

/**
 * Store image with embeddings in MongoDB
 * @param {object} imageData - Image data object
 * @returns {Promise<object>} Saved image document
 */
export const storeImageWithEmbeddings = async (imageData) => {
  const {
    eventId,
    organizerId,
    imageUrl,
    publicId,
    embeddings,
    faceCount,
    uploadedBy = "organizer",
  } = imageData;

  // Validate required fields
  if (!eventId || !organizerId || !imageUrl || !publicId || !embeddings) {
    throw new Error("Missing required image data fields");
  }

  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error("Embeddings must be a non-empty array");
  }

  if (faceCount !== embeddings.length) {
    throw new Error("Face count must match number of embeddings");
  }

  // Calculate magnitudes for each embedding
  const magnitudes = embeddings.map((embedding) =>
    calculateMagnitude(embedding),
  );

  // Create and save image document
  const image = new ImageModel({
    event: eventId,
    organizer: organizerId,
    imageUrl,
    publicId,
    faceEmbeddings: embeddings,
    faceCount,
    embeddingMagnitudes: magnitudes,
    uploadedBy,
    isProcessed: true,
  });

  const savedImage = await image.save();
  return savedImage;
};

/**
 * Get all embeddings for an event
 * @param {string} eventId - Event ID
 * @param {object} options - Query options (limit, skip, etc.)
 * @returns {Promise<Array>} Array of image documents with embeddings
 */
export const getEventImages = async (eventId, options = {}) => {
  const { limit = 1000, skip = 0, includeFaceDetails = false } = options;

  if (!eventId) {
    throw new Error("Event ID is required");
  }

  const query = ImageModel.find({ event: eventId, isProcessed: true })
    .select(
      includeFaceDetails
        ? "imageUrl publicId faceEmbeddings faceCount embeddingMagnitudes createdAt"
        : "imageUrl publicId faceEmbeddings embeddingMagnitudes",
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const images = await query.lean().exec();

  return images;
};

/**
 * Get specific image with embeddings
 * @param {string} imageId - Image ID
 * @returns {Promise<object>} Image document
 */
export const getImageById = async (imageId) => {
  if (!imageId) {
    throw new Error("Image ID is required");
  }

  const image = await ImageModel.findById(imageId)
    .select("imageUrl publicId faceEmbeddings embeddingMagnitudes")
    .lean()
    .exec();

  if (!image) {
    throw new Error("Image not found");
  }

  return image;
};

/**
 * Delete image from database
 * @param {string} imageId - Image ID to delete
 * @returns {Promise<object>} Deleted image document
 */
export const deleteImageFromDatabase = async (imageId) => {
  if (!imageId) {
    throw new Error("Image ID is required");
  }

  const image = await ImageModel.findByIdAndDelete(imageId).lean().exec();

  if (!image) {
    throw new Error("Image not found");
  }

  return image;
};

/**
 * Update image processing status
 * @param {string} imageId - Image ID
 * @param {boolean} isProcessed - Processing status
 * @param {string} errorMessage - Error message if failed
 * @returns {Promise<object>} Updated image document
 */
export const updateImageProcessingStatus = async (
  imageId,
  isProcessed,
  errorMessage = null,
) => {
  if (!imageId) {
    throw new Error("Image ID is required");
  }

  const updateData = { isProcessed };
  if (errorMessage) {
    updateData.processingError = errorMessage;
  }

  const image = await ImageModel.findByIdAndUpdate(imageId, updateData, {
    new: true,
    runValidators: true,
  })
    .lean()
    .exec();

  if (!image) {
    throw new Error("Image not found");
  }

  return image;
};

/**
 * Get all images for an event with pagination and filtering
 * @param {string} eventId - Event ID
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Items per page
 * @returns {Promise<object>} Pagination result with images
 */
export const getPaginatedEventImages = async (
  eventId,
  page = 1,
  pageSize = 20,
) => {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  if (page < 1 || pageSize < 1) {
    throw new Error("Invalid pagination parameters");
  }

  const skip = (page - 1) * pageSize;

  const [images, total] = await Promise.all([
    getEventImages(eventId, { skip, limit: pageSize }),
    ImageModel.countDocuments({
      event: eventId,
      isProcessed: true,
    }),
  ]);

  return {
    images,
    pagination: {
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Count images in event
 * @param {string} eventId - Event ID
 * @returns {Promise<number>} Count of images
 */
export const countEventImages = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  return ImageModel.countDocuments({
    event: eventId,
    isProcessed: true,
  });
};

/**
 * Get image statistics for event
 * @param {string} eventId - Event ID
 * @returns {Promise<object>} Statistics object
 */
export const getImageStatistics = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  const stats = await ImageModel.aggregate([
    { $match: { event: eventId, isProcessed: true } },
    {
      $group: {
        _id: "$event",
        totalImages: { $sum: 1 },
        totalFaces: { $sum: "$faceCount" },
        averageFacesPerImage: { $avg: "$faceCount" },
      },
    },
  ]);

  return stats[0] || { totalImages: 0, totalFaces: 0, averageFacesPerImage: 0 };
};

/**
 * Bulk delete images for an event
 * @param {string} eventId - Event ID
 * @returns {Promise<object>} Deletion result
 */
export const deleteEventImages = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID is required");
  }

  const result = await ImageModel.deleteMany({
    event: eventId,
  });

  return {
    deletedCount: result.deletedCount,
    acknowledged: result.acknowledged,
  };
};
