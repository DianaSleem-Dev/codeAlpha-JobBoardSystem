import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    fileUrl: { type: String, required: true },
    title: { type: String },
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);