import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String},
    companyDescription: { type: String },
    website: { type: String },
    location: { type: String },
    logo: { type: String },
  },
  { timestamps: true }
);

export const Employer = mongoose.model("Employer", employerSchema);