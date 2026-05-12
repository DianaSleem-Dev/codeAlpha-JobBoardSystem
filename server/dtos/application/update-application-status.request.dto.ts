import { ApplicationStatus } from "../../enums/application-status.enum";

export type UpdateApplicationStatusRequestDto = {
  status: ApplicationStatus;
};