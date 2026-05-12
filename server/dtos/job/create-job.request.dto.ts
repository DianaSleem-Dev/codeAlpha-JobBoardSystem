import { ExperienceLevel } from "../../enums/experience-level.enum";
import { JobStatus } from "../../enums/job-status.enum";
import { JobType } from "../../enums/job-type.enum";

export type CreateJobRequestDto = {
  title: string;
  description: string;
  location?: string;

  salaryMin?: number;
  salaryMax?: number;

  jobType: JobType;
  experienceLevel: ExperienceLevel;

  skills: string[];

  categoryId: string;
  status:JobStatus






  
};