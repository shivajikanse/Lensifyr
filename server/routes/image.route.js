import express from "express";
import { body, param, query } from "express-validator";
import { organizerAuth } from "../middleware/auth.middleware.js";
import {
  uploadEventImage,
  findMatchedImages,
  previewMatches,
  deleteEventImage,
  getEventImagesList,
} from "../controller/image.controller.js";

const router = express.Router();

/**
 * POST /api/image/upload
 * Upload image to event (Organizer only)

 */
router.post(
  "/upload",
  organizerAuth,
  [
    body("eventId")
      .notEmpty()
      .withMessage("Event ID is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
  ],
  uploadEventImage,
);

/**
 * POST /api/image/find-matches
 * Upload selfie and find matching images (User endpoint)
 * Body: { eventId, selfie (file), similarity_threshold (optional, default 0.6) }
 */
router.post(
  "/find-matches",
  [
    body("eventId")
      .notEmpty()
      .withMessage("Event ID is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
    body("similarity_threshold")
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage("Similarity threshold must be between 0 and 1"),
  ],
  findMatchedImages,
);

/**
 * POST /api/image/preview-matches
 * Preview matches without generating ZIP file
 * Body: { eventId, selfie (file), similarity_threshold (optional) }
 */
router.post(
  "/preview-matches",
  [
    body("eventId")
      .notEmpty()
      .withMessage("Event ID is required")
      .isMongoId()
      .withMessage("Invalid event ID"),
    body("similarity_threshold")
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage("Similarity threshold must be between 0 and 1"),
  ],
  previewMatches,
);

/**
 * DELETE /api/image/delete/:imageId
 * Delete image from event (Organizer only)
 */
router.delete(
  "/delete/:imageId",
  organizerAuth,
  [param("imageId").isMongoId().withMessage("Invalid image ID")],
  deleteEventImage,
);

/**
 * GET /api/image/event/:eventId
 * Get images list for an event (with pagination)
 * Query: ?page=1&pageSize=20
 */
router.get(
  "/event/:eventId",
  [
    param("eventId").isMongoId().withMessage("Invalid event ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("pageSize")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Page size must be between 1 and 100"),
  ],
  getEventImagesList,
);

export default router;
