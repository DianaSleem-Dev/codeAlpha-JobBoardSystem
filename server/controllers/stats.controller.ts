import { Request, Response } from "express";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { JobApplication } from "../models/job-application.model";
import { Candidate } from "../models/candidate.model";
import { Job } from "../models/job.model";
import { JobStatus } from "../enums/job-status.enum";

export class StatsController {
  /**
   * @swagger
   * /stats/getStatistics:
   *   get:
   *     summary: Get user statistics
   *     tags: [Statistics]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/StatsResponseDto'
   *       404:
   *         description: Statistics not found
   *       400:
   *         description: Bad request
   */
  static async getStatistics(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      const employerId = req.user?.employerId;
      const candidateId = req.user?.candidateId;
      if (userRole === "CANDIDATE") {
        if (!candidateId) {
          return res.status(401).json(createErrorResponse("Unauthorized"));
        }
        const applicationsCount = await JobApplication.countDocuments({
          candidateId: candidateId,
        });
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
          return res
            .status(400)
            .json(createErrorResponse("Candidate not found"));
        }
        const profileViews = candidate?.profileViews || 0;
        res.status(200).json({ applicationsCount, profileViews });
      } else {
        if (!employerId) {
          return res.status(401).json(createErrorResponse("Unauthorized"));
        }
        const activeJobsCount = await Job.countDocuments({
          employerId: employerId,
          status: JobStatus.OPEN,
        });
        const activeJobs = await Job.find({
          employerId: employerId,
        }).select("_id");
        const jobIds = activeJobs.map((job) => job._id);

        const applicantsCount = await JobApplication.countDocuments({
         jobId: { $in: jobIds },
        });
        res.status(200).json({ activeJobsCount, applicantsCount });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return res.status(500).json({
        success: false,
        message,
      });
    }
  }
}
