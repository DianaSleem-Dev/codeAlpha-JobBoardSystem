import { ExperienceLevel } from "../../enums/experience-level.enum";
import { JobStatus } from "../../enums/job-status.enum";
import { JobType } from "../../enums/job-type.enum";

export type JobResponseDto = {
  id: string;

  employerId: string;

  category: {
    id: string;
    name?: string;
  };

  title: string;
  description: string;
  location?: string;

  salaryMin?: number;
  salaryMax?: number;

  jobType: JobType;
  experienceLevel: ExperienceLevel;

  skills: string[];

  status: JobStatus;

  createdAt: Date;
  updatedAt: Date;
};