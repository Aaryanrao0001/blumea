'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export function usePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      window.gtag('config', 'G-0FZVHEXGDX', {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);
}

export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Specific tracking functions for common events
export function trackPostView(postSlug: string, postTitle: string) {
  trackEvent('view_post', 'engagement', `${postSlug}: ${postTitle}`);
}

export function trackNewsletterSignup(email: string) {
  trackEvent('newsletter_signup', 'conversion', email);
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent('search', 'engagement', query, resultCount);
}

export function trackCategoryClick(categorySlug: string) {
  trackEvent('category_click', 'navigation', categorySlug);
}

export function trackPopularPostClick(postSlug: string) {
  trackEvent('popular_post_click', 'engagement', postSlug);
}
