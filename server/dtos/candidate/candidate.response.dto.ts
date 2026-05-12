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

export type CandidateResponseDto = {
  profilePicture?: string;

  biography?: string;

  socialLinks?: SocialLinkDto[];

  skills: string[];

  experience?: ExperienceDto[];

  education?: EducationDto[];

  jobTitle: string;

  resume?: string;
};