import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventModel",
      required: true,
      index: true, // Index for faster queries
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerModel",
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public ID for deletion
    },
    // Store embeddings as array of numbers
    // Can be 128D, 256D, or 512D depending on face detection model
    faceEmbeddings: {
      type: [[Number]], // Array of embeddings (each embedding is array of numbers)
      required: true,
      validate: {
        validator: function (embeddings) {
          // Validate that each embedding has consistent dimensions
          if (embeddings.length === 0) return false;
          const firstLength = embeddings[0].length;
          return embeddings.every((emb) => emb.length === firstLength);
        },
        message: "All embeddings must have the same dimension",
      },
    },
    // Number of faces detected in the image
    faceCount: {
      type: Number,
      required: true,
      min: 1,
    },
    // Store normalized embeddings magnitude for faster cosine similarity
    embeddingMagnitudes: {
      type: [Number],
      required: true,
    },
    // Metadata
    uploadedBy: {
      type: String,
      enum: ["organizer", "user"],
      default: "organizer",
    },
    isProcessed: {
      type: Boolean,
      default: true,
    },
    processingError: String,
  },
  { timestamps: true },
);

// Compound index on event and organizer for faster queries
imageSchema.index({ event: 1, organizer: 1 });

// Index for timestamp-based queries
imageSchema.index({ createdAt: -1 });

export default mongoose.model("ImageModel", imageSchema);
