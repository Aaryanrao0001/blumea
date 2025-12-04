import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/routes';

// For now, return static sitemap
// In production with MongoDB connected, this would fetch all posts, categories, and tags
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    '',
    '/reviews',
    '/blog',
    '/about',
    '/contact',
    '/privacy',
  ];

  const staticRoutes = staticPages.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Sample categories and posts for demonstration
  const categories = ['skincare', 'wellness', 'reviews', 'beauty'];
  const categoryRoutes = categories.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
