import mongoose, { InferSchemaType, model } from "mongoose";
import { SocialLinksEnum } from "../enums/social-links.enum";

/* =========================================================
 * SUB SCHEMAS
 * ========================================================= */

const socialLinkSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(SocialLinksEnum),
      required: false,
    },

    url: {
      type: String,
      required: false,
    },
  },
  {
    _id: false,
  },
);

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: false,
    },

    position: {
      type: String,
      required: false,
    },

    startDate: {
      type: Date,
      required: false,
    },

    endDate: {
      type: Date,
    },

    description: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const educationSchema = new mongoose.Schema(
  {
    university: {
      type: String,
      required: false,
    },

    degree: {
      type: String,
      required: false,
    },

    startDate: {
      type: Date,
      required: false,
    },

    endDate: {
      type: Date,
    },

    description: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

/* =========================================================
 * MAIN SCHEMA
 * ========================================================= */

const candidateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    profilePicture: {
      type: String,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    biography: {
      type: String,
    },

    skills: [
      {
        type: String,
      },
    ],

    experience: [experienceSchema],

    education: [educationSchema],

    socialLinks: [socialLinkSchema],

    jobTitle: {
      type: String,
      required: false,
    },

    resume: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
 * TYPES
 * ========================================================= */

export type CandidateDocument = InferSchemaType<typeof candidateSchema>;

/* =========================================================
 * MODEL
 * ========================================================= */

export const Candidate = model<CandidateDocument>("Candidate", candidateSchema);
