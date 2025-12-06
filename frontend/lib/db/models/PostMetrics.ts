import mongoose, { Schema, Document, Model } from 'mongoose';
import { PostMetrics } from '@/lib/types';

export interface IPostMetricsDocument extends Omit<PostMetrics, '_id'>, Document {}

const PostMetricsSchema = new Schema<IPostMetricsDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    date: { type: Date, required: true, index: true },
    pageViews: { type: Number, required: true, default: 0 },
    uniqueVisitors: { type: Number, required: true, default: 0 },
    avgTimeOnPage: { type: Number, required: true, default: 0 },
    bounceRate: { type: Number, required: true, default: 0 },
    scrollDepthAvg: { type: Number, required: true, default: 0 },
    socialShares: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: false,
  }
);

// Compound index for postId + date uniqueness
PostMetricsSchema.index({ postId: 1, date: 1 }, { unique: true });

export const PostMetricsModel: Model<IPostMetricsDocument> =
  mongoose.models.PostMetrics || mongoose.model<IPostMetricsDocument>('PostMetrics', PostMetricsSchema);

export default PostMetricsModel;
