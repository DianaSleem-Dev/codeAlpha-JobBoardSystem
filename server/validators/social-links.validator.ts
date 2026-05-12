import { SocialLinkDto } from "../dtos/socialLinks/social-links.dto";
import { SocialLinksEnum } from "../enums/social-links.enum";

export const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const normalizeUrl = (url: string): string => {
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    return `https://${url}`;
  }

  return url;
};

export const normalizeSocialLinks = (
  links?: string,
): SocialLinkDto[] => {
  if (!links) {
    return [];
  }

  const parsedLinks: unknown = JSON.parse(links);

  if (!Array.isArray(parsedLinks)) {
    throw new Error("Social links must be an array");
  }

  const usedTypes = new Set<string>();

  return parsedLinks.map((link) => {
    const socialLink = link as SocialLinkDto;

    if (!socialLink.type || !socialLink.url) {
      throw new Error(
        "Social link type and url are required",
      );
    }

    if (
      !Object.values(SocialLinksEnum).includes(
        socialLink.type,
      )
    ) {
      throw new Error(
        `Invalid social link type: ${socialLink.type}`,
      );
    }

    if (usedTypes.has(socialLink.type)) {
      throw new Error(
        `Duplicate social link type: ${socialLink.type}`,
      );
    }

    usedTypes.add(socialLink.type);

    const normalizedUrl = normalizeUrl(
      socialLink.url,
    );

    if (!isValidUrl(normalizedUrl)) {
      throw new Error(
        `Invalid URL: ${socialLink.url}`,
      );
    }

    return {
      type: socialLink.type,
      url: normalizedUrl,
    };
  });
};