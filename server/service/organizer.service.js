import OrganizerModel from "../models/organizer.model.js";

export const creatOrganizer = async ({
  name,
  email,
  password,
  studioName,
  studioAddress,
  phoneNumber,
}) => {
  if (
    !name ||
    !email ||
    !password ||
    !studioName ||
    !studioAddress ||
    !phoneNumber
  ) {
    throw new Error("All fields are required");
  }
  const existingOrganizer = await OrganizerModel.findOne({ email });
  if (existingOrganizer) {
    throw new Error("Organizer with this email already exists");
  }
  //crete new organizer
  const organizer = new OrganizerModel({
    name,
    email,
    password: await OrganizerModel.hashPassword(password), // Hash the password before saving
    studioName,
    studioAddress,
    phoneNumber,
  });
  await organizer.save();
  return organizer;
};

//update organizer profile
export const updateOrganizerservice = async (organizerId, data) => {
  const allowedUpdates = ["name", "studioName", "studioAddress", "phoneNumber"];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (data[field]) {
      updateData[field] = data[field];
    }
  });

  const updatedOrganizer = await OrganizerModel.findByIdAndUpdate(
    organizerId,
    updateData,
    { new: true, runValidators: true },
  );

  if (!updatedOrganizer) {
    throw new Error("Organizer not found");
  }
  return updatedOrganizer;
};
