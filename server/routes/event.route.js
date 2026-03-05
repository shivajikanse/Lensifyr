import express from "express";
import { body, param } from "express-validator";
import { organizerAuth } from "../middleware/auth.middleware.js";
import {
  createEvent,
  verifyEventCode,
  updateEvent,
  deleteEvent,
} from "../controller/event.controller.js";

const router = express.Router();

router.post(
  "/create",
  organizerAuth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("eventDate")
      .isISO8601()
      .toDate()
      .withMessage("Valid event date is required"),
  ],
  createEvent,
);

//verify event code
router.get(
  "/verify/:eventCode",
  [param("eventCode").notEmpty().withMessage("Event code is required")],
  verifyEventCode,
);

//Update and edit event
router.patch(
  "/update/:eventId",
  organizerAuth,
  [
    body("title").optional().notEmpty().withMessage("Title is required"),
    body("eventDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Valid event date is required"),
    body("coverImage")
      .optional()
      .isURL()
      .withMessage("Valid URL is required for cover image"),
  ],
  updateEvent,
);

//Delete event
router.delete("/delete/:eventId", organizerAuth, deleteEvent);

export default router;
