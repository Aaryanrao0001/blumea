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

// Phase 3: Living System Types

export type PostStatus = "draft" | "lab" | "scheduled" | "published" | "archived";
export type PostType = "blog" | "review";

export interface Post {
  _id: Types.ObjectId;

  // Origin & workflow
  source: "ai" | "manual" | "mixed";
  status: PostStatus;
  postType: PostType;

  // Core
  title: string;
  slug: string;

  // SEO
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;

  // Classification
  categorySlug: string;
  tagSlugs: string[];

  // Content
  excerpt: string;
  bodyFormat: "markdown" | "richtext";
  bodyRaw: string;
  wordCount: number;

  // Multi-slot images
  images: {
    featured?: { url: string; alt: string };
    card?: { url: string; alt: string };
    popularSlider?: { url: string; alt: string };
    inline?: {
      id: string;
      url: string;
      alt: string;
      caption?: string;
    }[];
  };

  // Review-specific fields
  review?: {
    productIds: Types.ObjectId[];
    overallRating: number;
    criteriaRatings?: { label: string; score: number }[];
    pros: string[];
    cons: string[];
    verdict: string;
  };

  // AI / topic metadata
  topicId?: Types.ObjectId;
  aiGenerationMeta?: {
    claudeModel: string;
    generatedAt: Date;
  };

  // Dates
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledFor?: Date;

  // Flags
  isFeatured?: boolean;
  isPopular?: boolean;
}

export interface PostMetrics {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  scrollDepthAvg: number;
  socialShares: number;
}

export interface PostRevenue {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  date: Date;
  affiliateClicks: number;
  conversions: number;
  revenue: number;
  epc: number; // earnings per click
}

export interface PostPerformance {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  successScore: number;
  engagementScore: number;
  seoScore: number;
  monetizationScore: number;
  lastCalculated: Date;
}

export interface StrategyConfig {
  _id: Types.ObjectId;
  weights: {
    engagement: number;
    seo: number;
    monetization: number;
  };
  topicPreferences: {
    category: string;
    weight: number;
  }[];
  contentRules: {
    introMaxWords: number;
    faqCount: number;
    useComparisonTable: boolean;
    comparisonTableProbability: number;
  };
  autoPublishEnabled: boolean;
  maxPostsPerDay: number;
  minSuccessScoreForRefresh: number;
  updatedAt: Date;
}
