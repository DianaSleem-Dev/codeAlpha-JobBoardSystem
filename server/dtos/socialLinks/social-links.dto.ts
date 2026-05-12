import { SocialLinksEnum } from "../../enums/social-links.enum";

export type SocialLinkDto = {
  type: SocialLinksEnum;
  url: string;
};