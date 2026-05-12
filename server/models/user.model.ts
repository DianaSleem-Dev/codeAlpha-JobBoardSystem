import mongoose from "mongoose";
import { UserRole } from "../enums/user-role.enum";
import { Gender } from "../enums/gender.enum";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    country: { type: String, required: true },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    dateOfBirth: { type: Date, required: true },

    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.FEMALE,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CANDIDATE,
      required: true,
    },
  },
  { timestamps: true },
);

// indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phoneNumber: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);