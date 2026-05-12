import { Request, Response } from "express";

import { Candidate } from "../models/candidate.model";

import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { CreateCandidateRequestDto } from "../dtos/candidate/create-candidate.request.dto";
import mongoose from "mongoose";

/* =========================================================
 * HELPERS
 * ========================================================= */

const buildFileUrl = (file?: Express.Multer.File): string | undefined => {
  if (!file) {
    return undefined;
  }

  return `${process.env.BASE_URL}/${file.path.replace(/\\/g, "/")}`;
};

interface CandidateFiles {
  profilePicture?: Express.Multer.File[];
  resume?: Express.Multer.File[];
}

/* =========================================================
 * CONTROLLER
 * ========================================================= */

export class CandidateController {
  /**
   * @swagger
   * /candidate/createCandidate:
   *   post:
   *     summary: Create candidate
   *     tags: [Candidate]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/CreateCandidateRequestDto'
   *     responses:
   *       201:
   *         description: Candidate created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CandidateResponseDto'
   */
  static async createCandidate(req: Request, res: Response) {
    try {
      const dto: CreateCandidateRequestDto = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const files = req.files as CandidateFiles;

      // ---------------- PARSE JSON STRINGS ----------------

      const skills =
        typeof dto.skills === "string"
          ? JSON.parse(dto.skills)
          : dto.skills || [];

      const experience =
        typeof dto.experience === "string"
          ? JSON.parse(dto.experience)
          : dto.experience || [];

      const education =
        typeof dto.education === "string"
          ? JSON.parse(dto.education)
          : dto.education || [];

      const socialLinks =
        typeof dto.socialLinks === "string"
          ? JSON.parse(dto.socialLinks)
          : dto.socialLinks || [];

      // ---------------- CREATE ----------------

      const candidate = await Candidate.create({
        userId,

        biography: dto.biography,

        jobTitle: dto.jobTitle,

        skills,

        experience,

        education,

        socialLinks,

        profilePicture: buildFileUrl(files?.profilePicture?.[0]),

        resume: buildFileUrl(files?.resume?.[0]),
      });

      return res
        .status(201)
        .json(
          createSuccessResponse(candidate, "Candidate created successfully"),
        );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";

      return res.status(500).json(createErrorResponse(message));
    }
  }
  /**
   * @swagger
   * /candidate/getCandidateDetails:
   *   get:
   *     summary: Get candidate details
   *     tags: [Candidate]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Candidate details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CandidateResponseDto'
   */
  static async getCandidateDetails(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const candidate = await Candidate.findOne({
        userId,
      }).lean();

      if (!candidate) {
        return res.status(404).json(createErrorResponse("Candidate not found"));
      }

      return res.status(200).json(candidate);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";

      return res.status(500).json(createErrorResponse(message));
    }
  }
  /**
   * @swagger
   * /candidate/getCandidateById/{id}:
   *   get:
   *     summary: Get candidate details
   *     tags: [Candidate]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Candidate ID
   *     responses:
   *       200:
   *         description: Candidate details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CandidateResponseDto'
   */
  static async getCandidateById(req: Request, res: Response) {
    try {
      const candidateId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!candidateId) {
        return res
          .status(400)
          .json(createErrorResponse("candidateId is required"));
      }

      const candidate = await Candidate.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(candidateId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },

        {
          $project: {
            _id: 1,
            profilePicture: 1,
            biography: 1,
            skills: 1,
            experience: 1,
            education: 1,
            socialLinks: 1,
            jobTitle: 1,
            resume: 1,

            userId: {
              _id: "$userId._id",
              firstName: "$userId.firstName",
              lastName: "$userId.lastName",
              email: "$userId.email",
            },
          },
        },
      ]);

      if (!candidate || candidate.length === 0) {
        return res.status(404).json(createErrorResponse("Candidate not found"));
      }

      return res.status(200).json(candidate[0]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";

      return res.status(500).json(createErrorResponse(message));
    }
  }
  /**
   * @swagger
   * /candidate/resumes:
   *   get:
   *     summary: Get candidate resumes
   *     description: Fetch all resumes of the authenticated candidate
   *     tags: [Candidate]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved candidate resumes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 _id:
   *                   type: string
   *                   example: "64f8c1a2b9c1a2d3e4f5a6b7"
   *                 resume:
   *                   type: string
   *                   example: "https://example.com/resume.pdf"
   *       401:
   *         description: Unauthorized (missing or invalid token)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: Unauthorized
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: Server error
   */
  static async getCandidateResumes(req: Request, res: Response) {
    try {
      const candidateId = req?.user?.candidateId;
      if (!candidateId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }
      const resumes = await Candidate.findOne(
        { _id: candidateId },
        "resume",
      ).lean();
      return res.status(200).json(resumes);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";

      return res.status(500).json(createErrorResponse(message));
    }
  }
  /**
   * @swagger
   * /candidate/updateCandidate:
   *   put:
   *     summary: Update candidate
   *     tags: [Candidate]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/CreateCandidateRequestDto'
   *     responses:
   *       200:
   *         description: Candidate updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CandidateResponseDto'
   */
  static async updateCandidate(req: Request, res: Response) {
    try {
      const dto: CreateCandidateRequestDto = req.body;

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const candidate = await Candidate.findOne({ userId });

      if (!candidate) {
        return res.status(404).json(createErrorResponse("Candidate not found"));
      }

      const files = req.files as CandidateFiles;

      // ---------------- PARSE JSON ----------------

      const skills =
        typeof dto.skills === "string" ? JSON.parse(dto.skills) : dto.skills;

      const experience =
        typeof dto.experience === "string"
          ? JSON.parse(dto.experience)
          : dto.experience;

      const education =
        typeof dto.education === "string"
          ? JSON.parse(dto.education)
          : dto.education;

      const socialLinks =
        typeof dto.socialLinks === "string"
          ? JSON.parse(dto.socialLinks)
          : dto.socialLinks;

      // ---------------- BASIC FIELDS ----------------

      if (dto.biography !== undefined) {
        candidate.biography = dto.biography;
      }

      if (dto.jobTitle !== undefined) {
        candidate.jobTitle = dto.jobTitle;
      }

      // ---------------- ARRAYS ----------------

      if (skills !== undefined) {
        candidate.skills = skills;
      }

      if (experience !== undefined) {
        candidate.experience = experience;
      }

      if (education !== undefined) {
        candidate.education = education;
      }

      if (socialLinks !== undefined) {
        candidate.socialLinks = socialLinks;
      }

      // ---------------- FILES ----------------

      if (files?.profilePicture?.[0]) {
        candidate.profilePicture = buildFileUrl(files.profilePicture[0]);
      }

      if (files?.resume?.[0]) {
        candidate.resume = buildFileUrl(files.resume[0]);
      }

      await candidate.save();

      return res
        .status(200)
        .json(
          createSuccessResponse(candidate, "Candidate updated successfully"),
        );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";

      return res.status(500).json(createErrorResponse(message));
    }
  }
  /**
   * @swagger
   * /candidate/getAllCandidates:
   *   get:
   *     summary: Get all candidates
   *     tags: [Candidate]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: searchText
   *         schema:
   *           type: string
   *         required: false
   *         description: Search by name, skills, education, etc.
   *
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         required: false
   *         description: Page number
   *
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         required: false
   *         description: Number of items per page
   *
   *     responses:
   *       200:
   *         description: Candidates list with pagination
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/CandidateResponseDto'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     pages:
   *                       type: integer
   */
  static async getAllCandidates(req: Request, res: Response) {
    try {
      const { searchText, page = "1", limit = "10" } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      const matchStage: any = {};

      if (searchText && searchText.toString().trim() !== "") {
        const regex = new RegExp(searchText.toString().trim(), "i");

        matchStage.$or = [
          { jobTitle: regex },
          { skills: regex },
          { "education.university": regex },
          { "experience.company": regex },
          { "userId.firstName": regex },
          { "userId.lastName": regex },
        ];
      }

      const candidates = await Candidate.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },

        ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),

        {
          $project: {
            profilePicture: 1,
            biography: 1,
            skills: 1,
            experience: 1,
            education: 1,
            socialLinks: 1,
            jobTitle: 1,
            resume: 1,
            _id: 1,
            userId: {
              firstName: 1,
              lastName: 1,
              email: 1,
            },
          },
        },

        { $skip: skip },
        { $limit: limitNumber },
      ]);

      const total = await Candidate.countDocuments(matchStage);

      return res.status(200).json({
        data: candidates,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error";
      return res.status(500).json(createErrorResponse(message));
    }
  }
}
