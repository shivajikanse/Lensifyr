import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const organizerSchema = new mongoose.Schema(
  {
    organizerId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Exclude password from query results by default
      minlength: 6, // Minimum password length
    },
    studioName: {
      type: String,
      required: true,
    },
    studioAddress: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // emailVerificationToken: String,
    // emailVerificationExpires: Date,
  },
  { timestamps: true },
);

//genrate JWT token method
organizerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h", // Token expires in 24 hour
  });
  return token;
};

// Compare Password Method
organizerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//  Hash Password Method
organizerSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const OrganizerModel = mongoose.model("OrganizerModel", organizerSchema);
export default OrganizerModel;
