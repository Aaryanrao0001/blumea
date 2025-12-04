import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPost } from '@/lib/types';

export interface IPostDocument extends Omit<IPost, '_id'>, Document {}

const CoverImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const CriteriaRatingSchema = new Schema(
  {
    label: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const PostSchema = new Schema<IPostDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ['blog', 'review'], required: true },
    excerpt: { type: String, required: true },
    body: { type: String, required: true },
    coverImage: { type: CoverImageSchema, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    isFeatured: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },
    readingTime: { type: Number },
    // Review-specific fields
    productName: { type: String },
    brand: { type: String },
    overallRating: { type: Number, min: 1, max: 5 },
    criteriaRatings: [CriteriaRatingSchema],
    pros: [{ type: String }],
    cons: [{ type: String }],
    verdict: { type: String },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
PostSchema.index({ title: 'text', excerpt: 'text', body: 'text' });

export const Post: Model<IPostDocument> =
  mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);

export default Post;
