import eventModel from "../models/event.model";
import { validationResult } from "express-validator";
import { createEventService } from "../service/event.service.js";

//create event
export const createEvent = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }

  const { title, eventDate } = req.body;
  try {
    const newEvent = await createEventService({
      organizer: req.organizer._id,
      title,
      eventDate,
    });
    res.status(201).json(newEvent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating event", error: error.message });
  }
};
