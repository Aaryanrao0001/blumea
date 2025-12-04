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
