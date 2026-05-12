import mongoose from "mongoose";
import { ApplicationStatus } from "../enums/application-status.enum";

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
     resume: {
      type: String,
    },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);