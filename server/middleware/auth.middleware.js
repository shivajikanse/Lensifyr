import OrganizerModel from "../models/organizer.model.js";
import jwt from "jsonwebtoken";

// Auth Miiddleware for Organizer
export const organizerAuth = async (req, res, next) => {
  let token;
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const organizer = await OrganizerModel.findById(decoded.id).select(
      "-password",
    );
    req.organizer = organizer;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
