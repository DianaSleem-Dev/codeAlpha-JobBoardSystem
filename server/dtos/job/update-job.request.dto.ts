import { JobStatus } from "../../enums/job-status.enum";
import { CreateJobRequestDto } from "./create-job.request.dto";

export type UpdateJobRequestDto = Partial<CreateJobRequestDto> & {
  status?: JobStatus;
};