import { Request, Response } from "express";
import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { CreateEmployerRequestDto } from "../dtos/employer/create-employer.request.dto";
import { Employer } from "../models/employer.model";
import { Job } from "../models/job.model";

const buildFileUrl = (file?: Express.Multer.File) =>
  file ? `${process.env.BASE_URL}/${file.path.replace(/\\/g, "/")}` : null;

export class EmployerController {
  /**
   * @swagger
   * /employer/createEmployer:
   *   post:
   *     summary: Create employer
   *     tags: [Employer]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               companyName:
   *                 type: string
   *               companyDescription:
   *                 type: string
   *               website:
   *                 type: string
   *               location:
   *                 type: string
   *               logo:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Success
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server Error
   */
  static async createEmployer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const dto = req.body as CreateEmployerRequestDto;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const employer = await Employer.create({
        userId,
        companyName: dto.companyName,
        companyDescription: dto.companyDescription,
        website: dto.website,
        location: dto.location,
        logo: buildFileUrl(req.file),
      });

      return res
        .status(201)
        .json(createSuccessResponse(employer, "Employer created successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }
  /**
   * @swagger
   * /employer/getEmployerById/{id}:
   *   get:
   *     summary: Get employer by ID
   *     tags: [Employer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Employer ID
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmployerResponseDto'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Employer not found
   *       500:
   *         description: Server Error
   */
 static async getEmployerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    // run both queries in parallel
    const [employer, jobs] = await Promise.all([
      Employer.findById(
        id,
        "companyName companyDescription website location logo"
      ).lean(),

      Job.find(
        { employerId: id },
        "title description location salaryMin salaryMax jobType experienceLevel status createdAt"
      )
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!employer) {
      return res.status(404).json(createErrorResponse("Employer not found"));
    }

    return res.status(200).json(
      {
        employer,
        jobs,
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json(createErrorResponse(message));
  }
}
  /**
   * @swagger
   * /employer/getEmployerDetails:
   *   get:
   *     summary: Get employer details
   *     tags: [Employer]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmployerResponseDto'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Not Found
   */
  static async getEmployerDetails(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const employer = await Employer.findOne(
        { userId },
        "companyName companyDescription website location logo",
      );

      if (!employer) {
        return res.status(404).json(createErrorResponse("Employer not found"));
      }

      return res.status(200).json(employer);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /employer/updateEmployer:
   *   put:
   *     summary: Update employer
   *     tags: [Employer]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               companyName:
   *                 type: string
   *               companyDescription:
   *                 type: string
   *               website:
   *                 type: string
   *               location:
   *                 type: string
   *               logo:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Success
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Not Found
   *       500:
   *         description: Server Error
   */
  static async updateEmployer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const dto = req.body as CreateEmployerRequestDto;

      if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
      }

      const employer = await Employer.findOne({ userId });

      if (!employer) {
        return res.status(404).json(createErrorResponse("Employer not found"));
      }

      employer.companyName = dto.companyName ?? employer.companyName;
      employer.companyDescription =
        dto.companyDescription ?? employer.companyDescription;
      employer.website = dto.website ?? employer.website;
      employer.location = dto.location ?? employer.location;

      if (req.file) {
        employer.logo = buildFileUrl(req.file);
      }

      await employer.save();

      return res
        .status(200)
        .json(createSuccessResponse(employer, "Updated successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }
      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /employer/getAllEmployers:
   *   get:
   *     summary: Get all employers
   *     tags: [Employer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: searchText
   *         schema:
   *           type: string
   *         required: false
   *         description: Search employers by company name
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
   *         description: Items per page
   *
   *     responses:
   *       200:
   *         description: employers list with pagination
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/EmployerResponseDto'
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
  static async getAllEmployers(req: Request, res: Response) {
    try {
      const { searchText, page = "1", limit = "10" } = req.query;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);
      const skip = (pageNumber - 1) * limitNumber;

      const matchStage: any = {
        companyDescription: { $ne: "" },
      };

      if (searchText && searchText.toString().trim() !== "") {
        const regex = new RegExp(searchText.toString().trim(), "i");

        matchStage.$or = [
          { companyName: regex },
          { companyDescription: regex },
          { location: regex },
        ];
      }

      const result = await Employer.aggregate([
        ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),

        {
          $facet: {
            data: [
              {
                $project: {
                  companyName: 1,
                  companyDescription: 1,
                  website: 1,
                  location: 1,
                  logo: 1,
                  _id: 1,
                },
              },
              { $skip: skip },
              { $limit: limitNumber },
            ],

            totalCount: [{ $count: "total" }],
          },
        },
      ]);

      const data = result[0]?.data || [];
      const total = result[0]?.totalCount[0]?.total || 0;

      return res.status(200).json({
        data,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }
}
