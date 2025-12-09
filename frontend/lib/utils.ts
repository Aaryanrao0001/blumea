import { clsx, type ClassValue } from 'clsx';

// Simple cn function without tailwind-merge for minimal dependencies
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
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

export function getPlaceholderImage(width: number, height: number): string {
  return `https://placehold.co/${width}x${height}/1A1A1A/D4AF37?text=Blumea`;
}

/**
 * Convert Phase 3 Post type to PostData format for components
 */
export function convertPhase3PostToPostData(post: Record<string, any>): Record<string, any> {
  const getCoverImage = (post: Record<string, any>) => {
    return post.images?.featured || post.images?.cover || post.images?.card || post.coverImage || { url: '', alt: post.title };
  };

  return {
    _id: post._id,
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
    overallRating: post.review?.overallRating,
    criteriaRatings: post.review?.criteriaRatings,
    pros: post.review?.pros,
    cons: post.review?.cons,
    verdict: post.review?.verdict,
  };
}
