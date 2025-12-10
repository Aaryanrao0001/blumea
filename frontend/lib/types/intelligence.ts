import { Types } from 'mongoose';

// Re-export the intelligence types for use across the application
export interface IRedditInsight {
  _id: Types.ObjectId;
  postId: string;
  subreddit: string;
  title: string;
  body: string;
  upvotes: number;
  comments: number;
  sentiment: number;
  keywords: string[];
  productsMentioned: string[];
  ingredientsMentioned: string[];
  intentType: "problem" | "review" | "ingredient_confusion" | "routine_help" | "viral_product" | "fail_story";
  permalink: string;
  timestamp: Date;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoogleTrendsInsight {
  _id: Types.ObjectId;
  keyword: string;
  timeRange: "today 1-m" | "today 3-m" | "today 12-m";
  interestOverTime: { date: string; score: number }[];
  relatedQueries: { keyword: string; type: "rising" | "top"; score: number }[];
  relatedTopics: { topic: string; score: number }[];
  trendDirection: "rising" | "falling" | "stable";
  projected30dGrowth: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISerpInsight {
  _id: Types.ObjectId;
  keyword: string;
  searchResults: {
    position: number;
    url: string;
    title: string;
    description: string;
    domain: string;
  }[];
  peopleAlsoAsk: { question: string; snippet: string }[];
  relatedSearches: string[];
  autocomplete: string[];
  featuredSnippet?: { type: string; content: string };
  lastScraped: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicOpportunity {
  _id: Types.ObjectId;
  topicId?: Types.ObjectId;
  keyword: string;
  title: string;
  score: number;
  redditMentions: number;
  redditSentiment: number;
  trendGrowth30d: number;
  searchVolumeIndicator: number;
  competitorStrength: number;
  paaQuestions: string[];
  relatedKeywords: string[];
  recommendedAction: "create_new" | "update_existing" | "ignore";
  status: "pending" | "actioned" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

// Service response types
export interface RedditScraperResult {
  success: boolean;
  insights: IRedditInsight[];
  error?: string;
}

export interface TrendsAnalysisResult {
  success: boolean;
  insights: IGoogleTrendsInsight[];
  error?: string;
}

export interface SerpAnalysisResult {
  success: boolean;
  insights: ISerpInsight[];
  error?: string;
}

export interface OpportunityCalculationResult {
  success: boolean;
  opportunities: ITopicOpportunity[];
  error?: string;
}

// Strategy report types
export interface IStrategyReport {
  generatedAt: Date;
  weeklyTrends: string[];
  topOpportunities: ITopicOpportunity[];
  contentRecommendations: string[];
  competitorInsights: string[];
  emergingTopics: string[];
  fullReport: string;
}
