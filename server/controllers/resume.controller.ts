import { Request, Response } from "express";
import { UploadResumeRequestDto } from "../dtos/resume/upload-resume.request.dto";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { Resume } from "../models/resume.model";

export class ResumeController {

  /**
   * @swagger
   * /resume/uploadResume:
   *   post:
   *     summary: Upload resume
   *     tags: [Resume]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - resume
   *             properties:
   *               resume:
   *                 type: string
   *                 format: binary
   *               title:
   *                 type: string
   *     responses:
   *       201:
   *         description: Resume uploaded successfully
   */
  static async uploadResume(req: Request, res: Response) {
    try {
      const dto: UploadResumeRequestDto = req.body;
      const candidateId = req.user?.id;

      if (!candidateId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      if (!req.file) {
        return res.status(400).json(createErrorResponse("No file uploaded"));
      }

      const fileUrl = `${process.env.BASE_URL}/${req.file.path.replace(/\\/g, "/")}`;

      const resume = await Resume.create({
        candidateId,
        title: dto.title,
        fileUrl,
      });

      return res
        .status(201)
        .json(createSuccessResponse(resume, "Resume uploaded successfully"));

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /resume/getResumesByCandidateID/{id}:
   *   get:
   *     summary: Get all resumes by candidate ID
   *     tags: [Resume]
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
   *         description: Success
   */
  static async getResumesByCandidateID(req: Request, res: Response) {
    try {
      const candidateId = req.params.id;

      if (!candidateId) {
        return res.status(400).json(createErrorResponse("candidateId is required"));
      }

      const resumes = await Resume.find({ candidateId });

      return res
        .status(200)
        .json(createSuccessResponse(resumes, "Success"));

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /resume/getAllResumes:
   *   get:
   *     summary: Get all resumes
   *     tags: [Resume]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success
   */
  static async getAllResumes(req: Request, res: Response) {
    try {
      const resumes = await Resume.find();

      return res
        .status(200)
        .json(createSuccessResponse(resumes, "Success"));

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /resume/updateResume/{id}:
   *   put:
   *     summary: Update resume (title + optional file upload)
   *     tags: [Resume]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               resume:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Updated successfully
   */
  static async updateResume(req: Request, res: Response) {
    try {
      const resumeId = req.params.id;
      const { title } = req.body;

      if (!resumeId) {
        return res.status(400).json(createErrorResponse("resumeId is required"));
      }

      const resume = await Resume.findById(resumeId);

      if (!resume) {
        return res.status(404).json(createErrorResponse("Resume not found"));
      }

      // update title
      resume.title = title ?? resume.title;

      // update file if exists
      if (req.file) {
        resume.fileUrl = `${process.env.BASE_URL}/${req.file.path.replace(/\\/g, "/")}`;
      }

      await resume.save();

      return res
        .status(200)
        .json(createSuccessResponse(resume, "Updated successfully"));

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /resume/deleteResume/{id}:
   *   delete:
   *     summary: Delete resume
   *     tags: [Resume]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Deleted successfully
   */
  static async deleteResume(req: Request, res: Response) {
    try {
      const resumeId = req.params.id;

      if (!resumeId) {
        return res.status(400).json(createErrorResponse("resumeId is required"));
      }

      const deleted = await Resume.findByIdAndDelete(resumeId);

      if (!deleted) {
        return res.status(404).json(createErrorResponse("Resume not found"));
      }

      return res
        .status(200)
        .json(createSuccessResponse(null, "Deleted successfully"));

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }
}