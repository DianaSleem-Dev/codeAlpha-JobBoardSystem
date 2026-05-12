import { SocialLinkDto } from "../socialLinks/social-links.dto";

export type ExperienceDto = {
  company: string;
  position: string;
  startDate: Date | string;
  endDate?: Date | string;
  description?: string;
};

export type EducationDto = {
  university: string;
  degree: string;
  startDate: Date | string;
  endDate?: Date | string;
  description?: string;
};

export type CreateCandidateRequestDto = {
  biography?: string;

  skills: string[]

  experience?: ExperienceDto[];

  education?: EducationDto[];

  socialLinks?: SocialLinkDto[];

  jobTitle: string;

  profilePicture?: string;

  resume?: string;
};