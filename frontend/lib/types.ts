import { Types } from 'mongoose';

export interface ICategory {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface ITag {
  _id: Types.ObjectId;
  title: string;
  slug: string;
}

export interface IAuthor {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  social?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface ICoverImage {
  url: string;
  alt: string;
}

export interface ICriteriaRating {
  label: string;
  score: number;
}

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  type: 'blog' | 'review';
  excerpt: string;
  body: string;
  coverImage: ICoverImage;
  category: Types.ObjectId | ICategory;
  tags: Types.ObjectId[] | ITag[];
  author: Types.ObjectId | IAuthor;
  publishedAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  isPopular: boolean;
  readingTime?: number;
  // Review-specific fields
  productName?: string;
  brand?: string;
  overallRating?: number;
  criteriaRatings?: ICriteriaRating[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
}

export interface ISubscriber {
  _id: Types.ObjectId;
  email: string;
  subscribedAt: Date;
  isActive: boolean;
}

// Populated versions for frontend use
export interface IPostPopulated extends Omit<IPost, 'category' | 'tags' | 'author'> {
  category: ICategory;
  tags: ITag[];
  author: IAuthor;
}

// Generic post type for components (works with both mock and real data)
export interface PostData {
  _id: string | Types.ObjectId;
  title: string;
  slug: string;
  type: 'blog' | 'review';
  excerpt: string;
  body: string;
  coverImage: ICoverImage;
  category: { _id: string | Types.ObjectId; title: string; slug: string; description?: string };
  tags: { _id: string | Types.ObjectId; title: string; slug: string }[];
  author: { _id: string | Types.ObjectId; name: string; slug: string; bio?: string; avatar?: string };
  publishedAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  isPopular: boolean;
  readingTime?: number;
  productName?: string;
  brand?: string;
  overallRating?: number;
  criteriaRatings?: ICriteriaRating[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
}

// Generic category type for components
export interface CategoryData {
  _id: string | Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  postCount?: number;
}

// API response types
export interface IPostsApiResponse {
  posts: IPostPopulated[];
  total: number;
  page: number;
  limit: number;
}

export interface ISearchApiResponse {
  results: IPostPopulated[];
  query: string;
}

export interface INewsletterApiResponse {
  success: boolean;
  message: string;
}

// Phase 2: AI Content Engine Types

export interface IIngredient {
  _id: Types.ObjectId;
  name: string;
  aliases: string[];
  category: "active" | "emollient" | "fragrance" | "preservative" | "surfactant" | "other";
  safetyRating: 0 | 1 | 2 | 3 | 4 | 5;
  benefits: string[];
  concerns: string[];
  bestForSkinTypes: string[];
  avoidForSkinTypes: string[];
  evidenceLevel: "strong" | "moderate" | "limited" | "anecdotal";
  references?: string[];
  updatedAt: Date;
  createdAt: Date;
}

export interface ISkincareProduct {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  slug: string;
  category: "cleanser" | "moisturizer" | "serum" | "sunscreen" | "treatment" | "other";
  imageUrl: string;
  productUrl: string;
  affiliateLinks: { merchant: string; url: string; }[];
  ingredientListRaw: string;
  ingredientNames: string[];
  skinTypes: string[];
  price?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductScore {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  overallScore: number;
  beneficialScore: number;
  harmfulPenalty: number;
  concentrationScore: number;
  evidenceScore: number;
  skinTypeCompatibility: { [skinType: string]: number };
  pros: string[];
  cons: string[];
  bestFor: string[];
  avoidIf: string[];
  lastCalculatedAt: Date;
  createdAt: Date;
}

export interface ITopic {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  ideaType: "trend" | "evergreen" | "update";
  source: "manual" | "google_trends" | "tiktok" | "reddit" | "other";
  trendScore: number;
  monetizationScore: number;
  difficultyScore?: number;
  status: "new" | "selected" | "used" | "rejected";
  relatedProductIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentJob {
  _id: Types.ObjectId;
  topicId: Types.ObjectId;
  targetPostType: "review" | "comparison" | "guide" | "ingredient_deep_dive";
  status: "pending" | "running" | "failed" | "completed";
  claudeModel: string;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGeneratedDraft {
  _id: Types.ObjectId;
  topicId: Types.ObjectId;
  productIds: Types.ObjectId[];
  postType: "blog" | "review";
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  categorySlug: string;
  tagSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  schemaJson: object;
  faq: { question: string; answer: string }[];
  outline: string[];
  bodyRaw: string;
  wordCount: number;
  status: "draft" | "approved" | "rejected" | "published";
  createdBy: "system" | "admin";
  createdAt: Date;
  updatedAt: Date;
  publishedPostId?: Types.ObjectId;
}

// Phase 3: Analytics Brain, Self-Optimization & Auto-Publishing Types

export interface IPostMetrics {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  date: string; // "2025-12-06" (UTC day bucket)
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;   // seconds
  bounceRate: number;      // 0–1
  scrollDepthAvg: number;  // 0–1
  searchImpressions?: number;
  searchClicks?: number;
  searchCtr?: number;
  avgPosition?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostRevenue {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  date: string;           // same daily bucket
  affiliateClicks: number;
  affiliateConversions: number;
  revenue: number;        // in base currency
  epc: number;            // earnings per click
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostPerformance {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  successScore: number;   // 0–100 overall
  engagementScore: number; // 0-100
  seoScore: number;        // 0-100
  monetizationScore: number; // 0-100
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostExperiment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  type: "title" | "cta" | "hero" | "layout";
  variants: {
    key: string;                 // "A" or "B"
    title?: string;
    heroSubtitle?: string;
    ctaText?: string;
    assignedWeight: number;      // % of traffic
  }[];
  startDate: Date;
  endDate?: Date;
  metrics: {
    [variantKey: string]: {
      impressions: number;
      clicks: number;
      conversions?: number;
    };
  };
  winningVariantKey?: string;
  status: "running" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface IStrategyConfig {
  _id: Types.ObjectId;
  version: number;
  
  // Scoring weights
  weights: {
    engagement: number;      // e.g., 0.4
    seo: number;             // e.g., 0.3
    monetization: number;    // e.g., 0.3
  };

  // Topic selection preferences
  topicPreferences: {
    acneWeight: number;
    antiAgingWeight: number;
    sunscreenWeight: number;
    barrierRepairWeight: number;
    [key: string]: number;
  };

  // Content style adjustments
  contentRules: {
    introMaxWords: number;
    includeComparisonTableProbability: number;
    includeRoutineSectionProbability: number;
    faqCount: number;
  };

  // Auto-publish toggle
  autoPublishEnabled: boolean;
  minSuccessScoreForRefresh: number;
  maxPostsPerDay: number;
  
  createdAt: Date;
  updatedAt: Date;
}
