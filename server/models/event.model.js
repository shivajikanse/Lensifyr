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
eventSchema.pre("save", async function () {
  if (!this.eventCode) {
    this.eventCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
});

export default mongoose.model("EventModel", eventSchema);
