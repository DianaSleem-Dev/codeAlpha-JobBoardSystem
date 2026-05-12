import { ApplicationStatus } from "../../enums/application-status.enum";

export type ApplicationResponseDto = {
  id: string;

  jobId: string;
  candidateId: string;

  resume: string;
  coverLetter?: string;

  status: ApplicationStatus;

  appliedAt: Date;
  updatedAt: Date;
};