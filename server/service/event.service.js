import eventModel from "../models/event.model";

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
