import { Request, Response } from "express";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { JobApplication } from "../models/job-application.model";
import { ApplyJobRequestDto } from "../dtos/application/apply-job.request.dto";
import { ApplicationStatus } from "../enums/application-status.enum";
import { Job } from "../models/job.model";
import { Candidate } from "../models/candidate.model";
import { User } from "../models/user.model";

export class JobApplicationController {
  /**
   * @swagger
   * /job-application/apply:
   *   post:
   *     summary: Apply to a job
   *     tags: [JobApplication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/JobApplicationRequestDto'
   *     responses:
   *       201:
   *         description: Application submitted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Application submitted successfully
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: jobId is required
   *       401:
   *         description: Unauthorized
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
  static async applyToJob(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const dto: ApplyJobRequestDto = req.body;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      if (!dto.jobId) {
        return res.status(400).json(createErrorResponse("jobId is required"));
      }

      // prevent duplicate applications (optional but important)
      const existing = await JobApplication.findOne({
        candidateId: dto.candidateId,
        jobId: dto.jobId,
      });

      if (existing) {
        return res
          .status(400)
          .json(createErrorResponse("You already applied to this job"));
      }

      await JobApplication.create({
        candidateId: dto.candidateId,
        jobId: dto.jobId,
        resume: dto.resume,
        coverLetter: dto.coverLetter,
        status: ApplicationStatus.PENDING,
        createdAt: new Date(),
      });

      return res
        .status(201)
        .json(createSuccessResponse("Application submitted successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }

      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /job-application/my-applications:
   *   get:
   *     summary: Get logged-in candidate applications
   *     tags: [JobApplication]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           example: 1
   *         required: false
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           example: 10
   *         required: false
   *         description: Number of applications per page
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/JobApplicationResponseDto'
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
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async getMyApplications(req: Request, res: Response) {
    try {
      const candidateId = req.user?.candidateId;
      const { page = "1", limit = "10" } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      if (!candidateId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const total = await JobApplication.countDocuments({ candidateId });

      const applications = await JobApplication.find({ candidateId })
        .populate({
          path: "jobId",
          populate: {
            path: "employerId",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

      return res.status(200).json({
        data: applications,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }

      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /job-application/job/{jobId}/applications:
   *   get:
   *     summary: Get all applications for a job
   *     tags: [JobApplication]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: jobId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Applications retrieved
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async getApplicationsForJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const applications = await JobApplication.find({ jobId });

      return res
        .status(200)
        .json(createSuccessResponse(applications, "Success"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }

      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /job-application/{applicationId}/status:
   *   put:
   *     summary: Update application status
   *     tags: [JobApplication]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: applicationId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [PENDING, ACCEPTED, REJECTED,"REVIEWED"]
   *     responses:
   *       200:
   *         description: Status updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  static async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json(createErrorResponse("status is required"));
      }

      const updated = await JobApplication.findByIdAndUpdate(
        applicationId,
        { status },
        { new: true },
      );

      if (!updated) {
        return res
          .status(404)
          .json(createErrorResponse("Application not found"));
      }

      return res
        .status(200)
        .json(createSuccessResponse(updated, "Status updated"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }

      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }
/**
 * @swagger
 * /job-application/applicants:
 *   get:
 *     summary: Get all applicants for logged-in company jobs (with pagination)
 *     tags: [JobApplication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: false
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully fetched applicants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobApplicationId:
 *                         type: string
 *                         example: "689d2a12c44f9b0012345678"
 *                       status:
 *                         type: string
 *                         example: "PENDING"
 *                       firstName:
 *                         type: string
 *                         example: "Diana"
 *                       lastName:
 *                         type: string
 *                         example: "Sleem"
 *                       email:
 *                         type: string
 *                         example: "diana@gmail.com"
 *                       phoneNumber:
 *                         type: string
 *                         example: "+96170123456"
 *                       jobTitle:
 *                         type: string
 *                         example: "Frontend Developer"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                 message:
 *                   type: string
 *                   example: Unknown error
 */
static async getApplicantsForCompany(req: Request, res: Response) {
  try {
    const employerId = req.user?.employerId;

    const { page = "1", limit = "10" } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    if (!employerId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    // get company jobs
    const employerJobs = await Job.find({ employerId }, "_id");

    const jobIds = employerJobs.map((job) => job._id);

    // total applications count
    const total = await JobApplication.countDocuments({
      jobId: { $in: jobIds },
    });

    // paginated applications
    const jobApplications = await JobApplication.find({
      jobId: { $in: jobIds },
    })
      .select("_id status candidateId jobId")
      .populate({
        path: "candidateId",
        select: "userId",
        populate: {
          path: "userId",
          select: "firstName lastName email phoneNumber",
        },
      })
      .populate({
        path: "jobId",
        select: "title",
      })
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // newest first

    const formattedApplicants = jobApplications.map((app: any) => ({
      jobApplicationId: app._id,
      status: app.status,

      firstName: app.candidateId?.userId?.firstName,
      lastName: app.candidateId?.userId?.lastName,
      email: app.candidateId?.userId?.email,
      phoneNumber: app.candidateId?.userId?.phoneNumber,

      jobTitle: app.jobId?.title,
    }));

    return res.status(200).json({
      data: formattedApplicants,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(500).json(createErrorResponse(err.message));
    }

    return res.status(500).json(createErrorResponse("Unknown error"));
  }
}
}
