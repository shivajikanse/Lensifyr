import express from "express";
import { body } from "express-validator";
import {
  registerOrganizer,
  loginOrganizer,
  getOrganizerProfile,
  updateOrganizerProfile,
} from "../controller/organizer.controller.js";
import { organizerAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

//Organizer Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("studioName").notEmpty().withMessage("Studio name is required"),
    body("studioAddress").notEmpty().withMessage("Studio address is required"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  ],
  registerOrganizer,
);

//Organizer Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  loginOrganizer,
);

//profile
router.get("/profile", organizerAuth, getOrganizerProfile);

//upodate profile
router.patch(
  "/update-profile",
  organizerAuth,
  [
    body("name").optional().notEmpty().withMessage("Name is required"),
    body("studioName")
      .optional()
      .notEmpty()
      .withMessage("Studio name is required"),
    body("studioAddress")
      .optional()
      .notEmpty()
      .withMessage("Studio address is required"),
    body("phoneNumber")
      .optional()
      .notEmpty()
      .withMessage("Phone number is required"),
  ],
  updateOrganizerProfile,
);

//delete cookie on logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "Logout successful" });
});

export default router;
