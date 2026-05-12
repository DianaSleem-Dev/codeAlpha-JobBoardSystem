import { ExperienceLevel } from "../../enums/experience-level.enum";
import { JobType } from "../../enums/job-type.enum";

export type JobFilterRequestDto = {
  search?: string;

  location?: string;

  jobType?: JobType;

  experienceLevel?: ExperienceLevel;

  salaryMin?: number;
  salaryMax?: number;

  skills?: string[];

  categoryId?: string;
};