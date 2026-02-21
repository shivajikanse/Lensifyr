import express from "express";
import { body } from "express-validator";
import { organizerAuth } from "../middleware/auth.middleware";
import router from "./orgnizer.route";

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
