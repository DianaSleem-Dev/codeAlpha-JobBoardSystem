import mongoose from "mongoose";
import { JobType } from "../enums/job-type.enum";
import { JobStatus } from "../enums/job-status.enum";
import { ExperienceLevel } from "../enums/experience-level.enum";

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employer",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    salaryMin: {
      type: Number,
    },

    salaryMax: {
      type: Number,
    },

    jobType: {
      type: String,
      enum: Object.values(JobType),
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.OPEN,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Job = mongoose.model("Job", jobSchema);
