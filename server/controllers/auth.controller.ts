import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

import { RegisterRequestDto } from "../dtos/auth/register.request.dto";
import { LoginRequestDto } from "../dtos/auth/login.request.dto";

import { createErrorResponse } from "../helpers/createErrorResponse";
import { createSuccessResponse } from "../helpers/createSuccessResponse";
import { createToken } from "../utils/jwt.util";
import { UserRole } from "../enums/user-role.enum";
import { Employer } from "../models/employer.model";
import { Candidate } from "../models/candidate.model";

export class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequestDto'
   *     responses:
   *       201:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *       400:
   *         description: Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */

  static async register(req: Request, res: Response) {
    try {
      let employerId = null;
      let candidateId = null;
      const dto: RegisterRequestDto = req.body;

      // check email
      const existingEmail = await User.findOne({ email: dto.email });

      if (existingEmail) {
        return res
          .status(400)
          .json(createErrorResponse("Email already exists", "EMAIL_EXISTS"));
      }

      // check phone number
      const existingPhone = await User.findOne({
        phoneNumber: dto.phoneNumber,
      });

      if (existingPhone) {
        return res
          .status(400)
          .json(
            createErrorResponse("Phone number already exists", "PHONE_EXISTS"),
          );
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await User.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        country: dto.country,
        dateOfBirth: dto.dateOfBirth,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      });
      if (dto.role === UserRole.EMPLOYER) {
        const employer = await Employer.create({
          userId: user._id,
          companyName: "",
          companyDescription: "",
          website: "",
          location: "",
          logo: "",
        });

        employerId = employer._id;
      } else {
        const candidate = await Candidate.create({
          userId: user._id,

          jobTitle: "",

          biography: "",

          skills: [],

          experience: [
            {
              company: "",
              position: "",
              startDate: "",
              endDate: "",
              description: "",
            },
          ],

          education: [
            {
              university: "",
              degree: "",
              startDate: "",
              endDate: "",
              description: "",
            },
          ],

          socialLinks: [],
          profilePicture: "",
          resume: "",
        });

        candidateId = candidate._id;
      }
      const token = createToken({
        candidateId,
        employerId,
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
      });

      return res
        .status(201)
        .json(createSuccessResponse({ token }, "User registered successfully"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }

      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequestDto'
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *       400:
   *         description: Invalid password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponseDto'
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */

  static async login(req: Request, res: Response) {
    try {
      const dto: LoginRequestDto = req.body;

      const user = await User.findOne({ email: dto.email });

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("User not found", "USER_NOT_FOUND"));
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json(createErrorResponse("Invalid password", "INVALID_PASSWORD"));
      }

      let employerId = null;
      let candidateId = null;
      if (user.role === UserRole.EMPLOYER) {
        const employer = await Employer.findOne({ userId: user._id });
        employerId = employer?._id || null;
      } else {
        const candidate = await Candidate.findOne({ userId: user._id });
        candidateId = candidate?._id || null;


      }

      const token = createToken({
        candidateId,
        id: user._id,
        role: user.role,
        employerId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
      });

      return res.json(createSuccessResponse({ token }, "Login successful"));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json(createErrorResponse(err.message));
      }

      return res.status(500).json(createErrorResponse("Unknown error"));
    }
  }
}
