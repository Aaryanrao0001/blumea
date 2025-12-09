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
  date: string | Date; // "2025-12-06" daily bucket (UTC) or Date object for backward compatibility

  // Traffic
  pageViews: number;
  uniqueVisitors: number;
  sessions?: number;

  // Engagement (legacy fields maintained)
  avgTimeOnPage?: number;  // deprecated, use avgEngagedTime
  avgEngagedTime?: number; // seconds (GA4 engagement time)
  bounceRate: number;      // 0-1
  scrollDepthAvg: number;  // 0-1
  scrollDepthP75?: number; // 0-1
  exitsFromPage?: number;
  socialShares?: number;

  // Devices & geo
  mobileShare?: number;    // 0-1
  desktopShare?: number;   // 0-1
  topCountries?: {
    countryCode: string;   // "US", "IN", etc.
    share: number;         // 0-1
  }[];

  // Acquisition (from GA4)
  byChannel?: {
    channel: "organic_search" | "social" | "direct" | "email" | "referral" | "paid";
    sessions: number;
  }[];

  // SEO (from Search Console)
  searchImpressions?: number;
  searchClicks?: number;
  searchCtr?: number;
  avgPosition?: number;

  createdAt?: Date;
  updatedAt?: Date;
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
  window?: "7d" | "30d" | "90d";

  engagementScore: number;      // 0-100
  seoScore: number;             // 0-100
  monetizationScore: number;    // 0-100
  successScore: number;         // 0-100 overall

  // Diagnostics
  mainWeakness?: "traffic" | "engagement" | "conversion" | "seo" | "none";
  mainStrength?: "traffic" | "engagement" | "conversion" | "seo" | "none";

  lastCalculated?: Date;        // for backward compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StrategyConfig {
  _id: Types.ObjectId;
  version?: number;
  createdAt?: Date;
  updatedAt: Date;

  // Global weights for success score
  weights: {
    engagement: number;    // e.g., 0.4
    seo: number;           // 0.3
    monetization: number;  // 0.3
  };

  // Content mix & volume
  contentVolume?: {
    maxPostsPerDay: number;
    minPostsPerDay: number;
    maxPostsPerWeek: number;
    perType?: {
      blog?: { minPerWeek: number; maxPerWeek: number };
      review?: { minPerWeek: number; maxPerWeek: number };
      comparison?: { minPerWeek: number; maxPerWeek: number };
    };
    perCategory?: {
      [categorySlug: string]: { targetShare: number }; // e.g., 0.3 of posts
    };
  };

  // Timing strategy
  scheduling?: {
    primaryTimezone?: string; // e.g., "America/New_York"
    timeSlots?: {
      slotId: string;
      daysOfWeek: number[];        // 0-6
      startHour: number;
      endHour: number;
      priorityFor: ("blog" | "review")[];
    }[];
    bestTimesByCategory?: {
      [categorySlug: string]: {
        dayOfWeek: number;
        hour: number;
        confidence: number;
      }[];
    };
  };

  // Topic preferences (enhanced)
  topicPreferences: {
    category: string;
    weight: number;
  }[];
  topicPreferencesByCategory?: { [category: string]: number };
  topicPreferencesByFormat?: {
    routineGuide?: number;
    comparison?: number;
    deepDive?: number;
    quickTips?: number;
    listicle?: number;
  };

  // Content style & layout rules (enhanced for Claude)
  contentRules: {
    introMaxWords: number;
    faqCount: number;
    useComparisonTable: boolean;
    comparisonTableProbability: number;
    bodyTargetWordCount?: {
      blog?: number;
      review?: number;
      comparison?: number;
      deepDive?: number;
    };
    includeRoutineSectionProbability?: number;
    toneVariants?: {
      calm_explainer?: number;
      slightly_playful?: number;
      clinical?: number;
    };
  };

  // Safety & review gates
  safety?: {
    autoPublishEnabled: boolean;
    requireManualReviewForCategories?: string[];
    maxPostsPerDayAuto?: number;
    maxRiskTopicsPerWeek?: number;
  };

  // Experimentation preferences
  experiments?: {
    enableTitleABTest?: boolean;
    enableCTAABTest?: boolean;
    minImpressionsForDecision?: number;
  };

  // Refresh policy
  refreshPolicy?: {
    enableAutoRefresh?: boolean;
    minDaysOld?: number;
    minTrafficForRefresh?: number;
    decayThreshold?: number;
  };

  // Legacy fields (backward compatibility)
  autoPublishEnabled: boolean;
  maxPostsPerDay: number;
  minSuccessScoreForRefresh: number;
}

// Phase 3: Content Planning

export interface ContentPlanItem {
  _id: Types.ObjectId;
  scheduledDateTime: Date;
  topicId?: Types.ObjectId;
  postType: "blog" | "review" | "comparison";
  categorySlug: string;
  status: "planned" | "in_progress" | "completed" | "skipped";
  generatedDraftId?: Types.ObjectId;
  publishedPostId?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentPlan {
  _id: Types.ObjectId;
  weekStart: Date; // Monday of the week
  weekEnd: Date;
  items: ContentPlanItem[];
  totalPlanned: number;
  totalCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

// Phase 3: A/B Testing & Experiments

export interface ExperimentVariant {
  variantId: string; // "A", "B", "C"
  value: string;     // The actual title/CTA text
  impressions: number;
  clicks: number;
  conversions: number;
  engagementTime: number;
}

export interface PostExperiment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  experimentType: "title" | "cta" | "intro";
  status: "running" | "concluded" | "cancelled";
  variants: ExperimentVariant[];
  winnerVariantId?: string;
  startedAt: Date;
  concludedAt?: Date;
  minImpressionsPerVariant: number;
  confidenceThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}
