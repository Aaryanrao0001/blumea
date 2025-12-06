import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPostMetrics {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  scrollDepthAvg: number;
  searchImpressions?: number;
  searchClicks?: number;
  searchCtr?: number;
  avgPosition?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostMetricsDocument extends Omit<IPostMetrics, '_id'>, Document {}

const PostMetricsSchema = new Schema<IPostMetricsDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  date: { type: String, required: true, index: true },
  pageViews: { type: Number, required: true, default: 0 },
  uniqueVisitors: { type: Number, required: true, default: 0 },
  avgTimeOnPage: { type: Number, required: true, default: 0 },
  bounceRate: { type: Number, required: true, default: 0, min: 0, max: 1 },
  scrollDepthAvg: { type: Number, required: true, default: 0, min: 0, max: 1 },
  searchImpressions: { type: Number },
  searchClicks: { type: Number },
  searchCtr: { type: Number, min: 0, max: 1 },
  avgPosition: { type: Number },
}, { timestamps: true });

// Compound index for unique postId + date
PostMetricsSchema.index({ postId: 1, date: 1 }, { unique: true });

export const PostMetrics: Model<IPostMetricsDocument> = mongoose.models.PostMetrics || mongoose.model<IPostMetricsDocument>('PostMetrics', PostMetricsSchema);
export default PostMetrics;
