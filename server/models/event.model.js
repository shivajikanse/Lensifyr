import mongoose from "mongoose";
import crypto from "crypto";

const eventSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerModel",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    eventCode: {
      type: String,
      required: true,
      unique: true,
    },

    coverImage: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

//genearte unique event code before saving
eventSchema.pre("save", function (next) {
  if (!this.eventCode) {
    this.eventCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  next();
});

export default mongoose.model("EventModel", eventSchema);
