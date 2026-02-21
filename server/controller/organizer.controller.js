import OrganizerModel from "../models/organizer.model.js";
import { validationResult } from "express-validator";
import {
  creatOrganizer,
  updateOrganizerservice,
} from "../service/organizer.service.js";

// Organizer Registration
export const registerOrganizer = async (req, res) => {
  const error = validationResult(req); //validate error
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { name, email, password, studioName, studioAddress, phoneNumber } =
    req.body;
  // console.log(req.body);

  const organizer = await creatOrganizer({
    name,
    email,
    password,
    studioName,
    studioAddress,
    phoneNumber,
  });
  if (organizer) {
    res
      .status(201)
      .json({ message: "Organizer registered successfully", organizer });
  } else {
    res.status(500).json({ message: "Failed to register organizer" });
  }
};

//LoginOrganizer
export const loginOrganizer = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { email, password } = req.body;
  const organizer = await OrganizerModel.findOne({ email }).select("+password");

  if (!organizer) {
    return res.status(404).json({ message: "Organizer not found" });
  }
  const isMatch = await organizer.comparePassword(password, organizer.password); // compare password

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = organizer.generateAuthToken(); //generate token
  res.cookie("token", token, {
    httpOnly: true,
  });
  return res
    .status(200)
    .json({ message: "Login successful", organizer, token });
};

//get profile
export const getOrganizerProfile = async (req, res) => {
  const organizer = req.organizer;
  res.status(200).json({ organizer });
};

//update profile
export const updateOrganizerProfile = async (req, res) => {
  try {
    const updatedOrganizer = await updateOrganizerservice(
      req.organizer._id,
      req.body,
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      organizer: updatedOrganizer,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
