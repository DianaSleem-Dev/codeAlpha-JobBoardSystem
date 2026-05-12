import { Request, Response } from "express";
import { Job } from "../models/job.model";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { CreateJobRequestDto } from "../dtos/job/create-job.request.dto";
import { JobApplication } from "../models/job-application.model";

export class JobController {
  /**
   * @swagger
   * /job/createJob:
   *   post:
   *     summary: Create a new job
   *     tags: [Job]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateJobRequestDto'
   *     responses:
   *       201:
   *         description: Job created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/JobResponseDto'
   *       400:
   *         description: Validation error
   *       500:
   *         description: Server error
   */
  static async createJob(req: Request, res: Response) {
    try {
      const employerId = req.user?.employerId;
      const dto: CreateJobRequestDto = req.body;
      if (!employerId) {
        return res.status(403).json({
          message: "Only employers can create jobs",
        });
      }

      const job = await Job.create({ ...dto, employerId });

      return res
        .status(201)
        .json(createSuccessResponse(job, "Job created successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }
  /**
   * @swagger
   * /job/getAllJobs:
   *   get:
   *     summary: Get all jobs
   *     tags: [Job]
   *     security:
   *       - bearerAuth: []
   *
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: number
   *         required: false
   *         example: 1
   *
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *         required: false
   *         example: 10
   *
   *       - in: query
   *         name: keywords
   *         schema:
   *           type: string
   *         required: false
   *         example: React
   *
   *       - in: query
   *         name: location
   *         schema:
   *           type: string
   *         required: false
   *         example: Beirut
   *
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *         required: false
   *
   *       - in: query
   *         name: jobType
   *         schema:
   *           type: string
   *           enum:
   *             - FULL_TIME
   *             - PART_TIME
   *             - CONTRACT
   *             - REMOTE
   *         required: false
   *
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/JobResponseDto'
   *
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: number
   *                       example: 120
   *
   *                     page:
   *                       type: number
   *                       example: 1
   *
   *                     limit:
   *                       type: number
   *                       example: 10
   *
   *                     pages:
   *                       type: number
   *                       example: 12
   *
   *       500:
   *         description: Server error
   */
  static async getAllJobs(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "10",
        keywords,
        location,
        categoryId,
        jobType,
      } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);

      const skip = (pageNumber - 1) * limitNumber;

      const filter: any = {};
      filter.status = "OPEN";
      // keywords
      if (keywords && keywords.toString().trim() !== "") {
        const regex = new RegExp(keywords.toString().trim(), "i");

        filter.$or = [
          { title: regex },
          { description: regex },
          { skills: regex },
        ];
      }

      // location
      if (location && location.toString().trim() !== "") {
        filter.location = {
          $regex: location.toString().trim(),
          $options: "i",
        };
      }

      // category
      if (categoryId) {
        filter.categoryId = categoryId;
      }

      // job type
      if (jobType) {
        filter.jobType = jobType;
      }

      const [jobs, total] = await Promise.all([
        Job.find(
          filter,
          "_id categoryId employerId description experienceLevel jobType location salaryMax salaryMin status title skills createdAt",
        )
          .populate("categoryId", "name")
          .populate("employerId", "companyName logo location")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        Job.countDocuments(filter),
      ]);

      return res.status(200).json({
        data: jobs,

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
 * /job/company-jobs:
 *   get:
 *     summary: Get logged-in company jobs
 *     tags: [Job]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
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
 *                     $ref: '#/components/schemas/JobResponseDto'
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
static async getCompanyJobs(req: Request, res: Response) {
  try {
    const employerId = req.user?.employerId;
    const { page = "1", limit = "10" } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    if (!employerId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const total = await Job.countDocuments({ employerId });

    const jobs = await Job.find({ employerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const applicantsCount = await JobApplication.countDocuments({
          jobId: job._id,
        });

        return {
          ...job,
          applicantsCount,
        };
      }),
    );

    return res.status(200).json({
      data: jobsWithApplicants,
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
   * /job/getJobById/{id}:
   *   get:
   *     summary: Get job by id
   *     tags: [Job]
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
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/JobResponseDto'
   *       404:
   *         description: Job not found
   *       400:
   *         description: Invalid ID
   */
  static async getJobById(req: Request, res: Response) {
    try {
      const job = await Job.findById(
        req.params.id,
        "_id categoryId employerId description experienceLevel jobType location salaryMax salaryMin status title skills createdAt",
      )
        .populate("categoryId", "name")
        .populate("employerId", "companyName logo location website")
        .lean();

      if (!job) {
        return res.status(404).json(createErrorResponse("Job not found"));
      }

      return res.status(200).json({ data: job });
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /job/updateJob/{id}:
   *   put:
   *     summary: Update job
   *     tags: [Job]
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
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateJobRequestDto'
   *     responses:
   *       200:
   *         description: Updated successfully
   *       404:
   *         description: Job not found
   *       400:
   *         description: Invalid ID
   */
  static async updateJob(req: Request, res: Response) {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json(createErrorResponse("Job not found"));
      }

      Object.assign(job, req.body);
      await job.save();

      return res
        .status(200)
        .json(createSuccessResponse(job, "Job updated successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /job/deleteJob/{id}:
   *   delete:
   *     summary: Delete job
   *     tags: [Job]
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
   *         description: Job Deleted successfully
   *       404:
   *         description: Job not found
   *       400:
   *         description: Invalid ID
   */
  static async deleteJob(req: Request, res: Response) {
    try {
      const jobId = req.params.id;

      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json(createErrorResponse("Job not found"));
      }

      // 1. delete all applications related to this job
      await JobApplication.deleteMany({ jobId });

      // 2. delete job itself
      await Job.findByIdAndDelete(jobId);

      return res
        .status(200)
        .json(createSuccessResponse(null, "Job deleted successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }
}
