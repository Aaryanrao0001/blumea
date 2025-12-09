import { clsx, type ClassValue } from 'clsx';
import { PostForSchema } from './seo';
import { convertGoogleDriveUrl } from './imageUtils';

// Simple cn function without tailwind-merge for minimal dependencies
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Extended post data type that includes all fields from conversion
export interface ConvertedPostData extends PostForSchema {
  _id: string;
  body: string;
  category: { _id: string; title: string; slug: string };
  tags: { _id: string; title: string; slug: string }[];
  author: { _id: string; name: string; slug: string };
  isFeatured: boolean;
  isPopular: boolean;
  readingTime?: number;
  criteriaRatings?: { label: string; score: number }[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Serialize a post for client components by converting ObjectIds and Dates to strings
 */
export function serializePost(post: any): any {
  if (!post) return post;
  
  return {
    ...post,
    _id: post._id?.toString ? post._id.toString() : post._id,
    publishedAt: post.publishedAt instanceof Date ? post.publishedAt.toISOString() : post.publishedAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    category: post.category ? {
      ...post.category,
      _id: post.category._id?.toString ? post.category._id.toString() : post.category._id,
    } : post.category,
    tags: post.tags?.map((tag: any) => ({
      ...tag,
      _id: tag._id?.toString ? tag._id.toString() : tag._id,
    })) || [],
    author: post.author ? {
      ...post.author,
      _id: post.author._id?.toString ? post.author._id.toString() : post.author._id,
    } : post.author,
  };
}

export function getPlaceholderImage(width: number, height: number): string {
  return `https://placehold.co/${width}x${height}/1A1A1A/D4AF37?text=Blumea`;
}

/**
 * Convert Phase 3 Post type to PostData format for components
 */
export function convertPhase3PostToPostData(post: Record<string, any>): ConvertedPostData {
  const getCoverImage = (post: Record<string, any>) => {
    const imageObj = post.images?.featured || post.images?.cover || post.images?.card || post.coverImage || { url: '', alt: post.title };
    // Convert Google Drive URLs to direct image URLs
    if (imageObj?.url) {
      return { ...imageObj, url: convertGoogleDriveUrl(imageObj.url) };
    }
    return imageObj;
  };

  return {
    _id: post._id?.toString() || post._id,
    title: post.title,
    slug: post.slug,
    type: post.postType || post.type || 'blog',
    excerpt: post.excerpt,
    body: post.bodyRaw || post.body || '',
    coverImage: getCoverImage(post),
    category: {
      _id: post.categorySlug || '',
      title: post.categorySlug || 'Uncategorized',
      slug: post.categorySlug || '',
    },
    tags: post.tagSlugs?.map((slug: string) => ({ _id: slug, title: slug, slug })) || [],
    author: {
      _id: post.createdBy || 'admin',
      name: post.createdBy || 'Admin',
      slug: post.createdBy || 'admin',
    },
    publishedAt: post.publishedAt || post.createdAt,
    updatedAt: post.updatedAt,
    isFeatured: post.isFeatured || false,
    isPopular: post.isPopular || false,
    readingTime: post.wordCount ? Math.ceil(post.wordCount / 200) : undefined,
    productName: post.productName,
    brand: post.brand,
    overallRating: post.review?.overallRating,
    criteriaRatings: post.review?.criteriaRatings,
    pros: post.review?.pros,
    cons: post.review?.cons,
    verdict: post.review?.verdict,
  };
}
