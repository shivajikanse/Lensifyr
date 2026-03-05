import eventModel from "../models/event.model.js";

//create event service
export const createEventService = async ({ organizer, title, eventDate }) => {
  if (!organizer || !title || !eventDate) {
    throw new Error("All fields are required");
  }
  const event = new eventModel({
    organizer,
    title,
    eventDate,
  });
  await event.save();
  return event;
};

// verify event code service
export const verifyEventCodeService = async (eventCode) => {
  if (!eventCode) {
    throw new Error("Event code is required");
  }
  const event = await eventModel.findOne({ eventCode, isActive: true });
  if (!event) {
    throw new Error("Invalid or inactive event code");
  }
  return event;
};
