import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { UserRole } from "../enums/user-role.enum";
import { Gender } from "../enums/gender.enum";
import { SocialLinksEnum } from "../enums/social-links.enum";
import { JobStatus } from "../enums/job-status.enum";
import { JobType } from "../enums/job-type.enum";
import { ExperienceLevel } from "../enums/experience-level.enum";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Board API",
      version: "1.0.0",
      description: "Backend API for Job Board Platform",
    },

    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        RegisterRequestDto: {
          type: "object",
          required: [
            "firstName",
            "lastName",
            "email",
            "password",
            "role",
            "gender",
            "dateOfBirth",
            "phoneNumber",
          ],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            gender: {
              type: "string",
              enum: Object.values(Gender),
              default: Gender.FEMALE,
            },
            country: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            phoneNumber: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role: {
              type: "string",
              enum: Object.values(UserRole),
              default: UserRole.CANDIDATE,
            },
          },
        },

        LoginRequestDto: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" },
          },
        },

        AuthResponseDto: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },

        ErrorResponseDto: {
          type: "object",
          properties: {
            success: { type: "boolean", default: false },
            message: { type: "string" },
            errorCode: { type: "string" },
            statusCode: { type: "number" },
          },
        },

        CreateCategoryRequestDto: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
          },
        },

        CategoryResponseDto: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
          },
        },
        StatsResponseDto: {
          type: "object",
          properties: {
            
            // candidate stats
            applicationsCount: {
              type: "number",
              example: 12,
            },

            profileViews: {
              type: "number",
              example: 55,
            },

            // employer stats
            activeJobsCount: {
              type: "number",
              example: 4,
            },

            applicantsCount: {
              type: "number",
              example: 31,
            },
          },
        },
        CreateCandidateRequestDto: {
          type: "object",

          required: ["skills", "jobTitle"],

          properties: {
            biography: {
              type: "string",
            },

            // multipart/form-data => JSON STRING
            skills: {
              type: "string",

              example: JSON.stringify(["React", "TypeScript", "Node.js"]),
            },

            // multipart/form-data => JSON STRING
            experience: {
              type: "string",

              example: JSON.stringify([
                {
                  company: "Google",
                  position: "Frontend Developer",
                  startDate: "2024-01-01",
                  endDate: "2025-01-01",
                  description: "Worked on React apps",
                },
              ]),
            },

            // multipart/form-data => JSON STRING
            education: {
              type: "string",

              example: JSON.stringify([
                {
                  university: "LIU",
                  degree: "Computer Science",
                  startDate: "2020-01-01",
                  endDate: "2024-01-01",
                  description: "Bachelor degree",
                },
              ]),
            },

            // multipart/form-data => JSON STRING
            socialLinks: {
              type: "string",

              example: JSON.stringify([
                {
                  type: "LINKEDIN",
                  url: "https://linkedin.com/in/test",
                },
              ]),
            },

            jobTitle: {
              type: "string",
            },

            profilePicture: {
              type: "string",
              format: "binary",
            },

            resume: {
              type: "string",
              format: "binary",
            },
          },
        },

        CandidateResponseDto: {
          type: "object",

          properties: {
            profileViews: {
              type: "number",
            },
            _id: {
              type: "string",
            },

            profilePicture: {
              type: "string",
            },

            biography: {
              type: "string",
            },

            resume: {
              type: "string",
            },

            userId: {
              type: "object",
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                email: { type: "string" },
              },
            },

            skills: {
              type: "array",
              items: {
                type: "string",
              },
            },

            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  position: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  description: { type: "string" },
                },
              },
            },

            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  university: { type: "string" },
                  degree: { type: "string" },
                  startDate: { type: "string", format: "date" },
                  endDate: { type: "string", format: "date" },
                  description: { type: "string" },
                },
              },
            },

            socialLinks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: Object.values(SocialLinksEnum),
                  },
                  url: {
                    type: "string",
                  },
                },
              },
            },

            jobTitle: {
              type: "string",
            },
          },
        },

        CandidateListResponseDto: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CandidateResponseDto",
              },
            },

            pagination: {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                pages: { type: "integer" },
              },
            },
          },
        },
        CreateEmployerRequestDto: {
          type: "object",
          required: [
            "companyName",
            "companyDescription",
            "website",
            "location",
            "logo",
          ],
          properties: {
            companyName: { type: "string" },
            companyDescription: { type: "string" },
            website: { type: "string" },
            location: { type: "string" },
            logo: { type: "string" },
          },
        },

        EmployerResponseDto: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },

            companyName: {
              type: "string",
            },

            companyDescription: {
              type: "string",
            },

            website: {
              type: "string",
            },

            location: {
              type: "string",
            },

            logo: {
              type: "string",
            },
          },
        },
        EmployerListResponseDto: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/EmployerResponseDto",
              },
            },

            pagination: {
              type: "object",
              properties: {
                total: {
                  type: "integer",
                },
                page: {
                  type: "integer",
                },
                limit: {
                  type: "integer",
                },
                pages: {
                  type: "integer",
                },
              },
            },
          },
        },
        CreateJobRequestDto: {
          type: "object",
          required: [
            "title",
            "description",
            "jobType",
            "experienceLevel",
            "skills",
            "categoryId",
          ],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            location: { type: "string" },

            salaryMin: { type: "number" },
            salaryMax: { type: "number" },
            status: {
              type: "string",
              enum: Object.values(JobStatus),
              default: JobStatus.OPEN,
            },
            jobType: {
              type: "string",
              enum: Object.values(JobType),
            },

            experienceLevel: {
              type: "string",
              enum: Object.values(ExperienceLevel),
            },

            skills: {
              type: "array",
              items: { type: "string" },
            },

            categoryId: { type: "string" },
          },
        },
        JobResponseDto: {
          type: "object",
          properties: {
            _id: { type: "string" },
            status: {
              type: "string",
              enum: Object.values(JobStatus),
            },
            categoryId: {
              type: "object",
              properties: {
                name: { type: "string" },
                _id: { type: "string" },
              },
            },
            employerId: {
              type: "object",
              properties: {
                companyName: { type: "string" },
                logo: { type: "string" },
                location: { type: "string" },
                website: { type: "string" },
              },
            },
            applicantsCount: { type: "number" },
            title: { type: "string" },
            description: { type: "string" },
            location: { type: "string" },
            salaryMin: { type: "number" },
            salaryMax: { type: "number" },
            jobType: {
              type: "string",
              enum: Object.values(JobType),
            },
            experienceLevel: {
              type: "string",
              enum: Object.values(ExperienceLevel),
            },
            skills: { type: "array", items: { type: "string" } },
            createdAt: { type: Date },
          },
        },

        JobApplicationRequestDto: {
          type: "object",
          required: ["jobId", "candidateId", "resume"],
          properties: {
            jobId: { type: "string" },
            candidateId: { type: "string" },
            resume: { type: "string" },
            coverLetter: { type: "string" },
          },
        },
        JobApplicationResponseDto: {
          type: "object",
          properties: {
            _id: { type: "string" },

            jobId: {
              type: "object",
              properties: {
                _id: { type: "string" },
                title: { type: "string" },
                employerId: {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    companyName: { type: "string" },
                    logo: { type: "string" },
                    location: { type: "string" },
                  },
                },
              },
            },

            candidateId: { type: "string" },
            resume: { type: "string" },
            coverLetter: { type: "string" },
            status: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },

        UploadResumeRequestDto: {
          type: "object",
          required: ["fileUrl"],
          properties: {
            fileUrl: {
              type: "string",
              format: "binary",
            },
            title: {
              type: "string",
            },
          },
        },

        ResumeResponseDto: {
          type: "object",
          properties: {
            candidateId: { type: "string" },
            title: { type: "string" },
            fileUrl: { type: "string" },
          },
        },
      },
    },
  },

  apis: ["./controllers/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerSpec };

export const setupSwagger = (app: any) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
