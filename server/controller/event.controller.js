import { validationResult } from "express-validator";
import {
  createEventService,
  // verifyEventCodeService,
} from "../service/event.service.js";
import eventModel from "../models/event.model.js";

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

//Verify event code
// export const verifyEventCode = async (req, res) => {
//   const error = validationResult(req);
//   if (!error.isEmpty()) {
//     return res.status(400).json({ errors: error.array() });
//   }
//   const { eventCode } = req.params;
//   try {
//     const event = await verifyEventCodeService(eventCode);
//     res.status(200).json(event);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error verifying event code", error: error.message });
//   }
// };

//update event
export const updateEvent = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ errors: error.array() });
  }
  const { eventId } = req.params;
  const { title, eventDate, coverImage } = req.body;
  try {
    const event = await eventModel.findOne({
      _id: eventId,
      organizer: req.organizer._id,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (title) event.title = title;
    if (eventDate) event.eventDate = eventDate;
    if (coverImage) event.coverImage = coverImage;
    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating event", error: error.message });
  }
};

//delete event
export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await eventModel.findOneAndDelete({
      _id: eventId,
      organizer: req.organizer._id,
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting event", error: error.message });
  }
};
