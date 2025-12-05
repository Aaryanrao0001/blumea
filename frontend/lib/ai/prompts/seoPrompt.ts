import { ITopic, ISkincareProduct } from '@/lib/types';

export function createSeoPrompt(
  draftBody: string,
  topic: ITopic,
  products: ISkincareProduct[]
): string {
  const productNames = products.map((p) => `${p.brand} ${p.name}`).join(', ');
  
  // Truncate body if too long
  const truncatedBody = draftBody.length > 5000 
    ? draftBody.substring(0, 5000) + '...' 
    : draftBody;

  return `You are an SEO expert for a skincare blog. Generate optimized metadata for the following article.

TOPIC: ${topic.title}
PRIMARY KEYWORD: ${topic.primaryKeyword}
PRODUCTS MENTIONED: ${productNames}

ARTICLE EXCERPT (first 5000 chars):
${truncatedBody}

Generate the following in a JSON object:

1. "seoTitle": An SEO-optimized title (50-60 characters) that includes the primary keyword
2. "seoDescription": A meta description (150-160 characters) that's compelling and includes the keyword
3. "slug": A URL-friendly slug based on the primary keyword (lowercase, hyphens only)
4. "excerpt": A 2-3 sentence excerpt for the article card (150-200 characters)
5. "faq": An array of 3-5 FAQ objects with "question" and "answer" properties
6. "schema": A JSON-LD Article schema object with:
   - "@context": "https://schema.org"
   - "@type": "Article"
   - "headline": The SEO title
   - "description": The meta description
   - "author": { "@type": "Organization", "name": "Blumea" }
   - "publisher": { "@type": "Organization", "name": "Blumea" }

Return ONLY the JSON object, no markdown formatting or code blocks.`;
}

export interface SeoData {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  excerpt: string;
  faq: { question: string; answer: string }[];
  schema: object;
}
