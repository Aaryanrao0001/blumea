export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blumea.me';
export const SITE_NAME = 'Blumea';
export const SITE_DESCRIPTION = 'Premium skincare reviews, beauty tips, and wellness insights. Discover your radiance with expert-curated content.';

export function getPostUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export function getCategoryUrl(slug: string): string {
  return `${SITE_URL}/category/${slug}`;
}

export function getTagUrl(slug: string): string {
  return `${SITE_URL}/tag/${slug}`;
}

export function getReviewsUrl(): string {
  return `${SITE_URL}/reviews`;
}

export function getBlogUrl(): string {
  return `${SITE_URL}/blog`;
}

export function getAboutUrl(): string {
  return `${SITE_URL}/about`;
}

export function getContactUrl(): string {
  return `${SITE_URL}/contact`;
}

export function getPrivacyUrl(): string {
  return `${SITE_URL}/privacy`;
}
