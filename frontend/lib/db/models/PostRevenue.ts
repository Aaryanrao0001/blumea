import mongoose, { Schema, Document, Model } from 'mongoose';
import { PostRevenue } from '@/lib/types';

export interface IPostRevenueDocument extends Omit<PostRevenue, '_id'>, Document {}

const PostRevenueSchema = new Schema<IPostRevenueDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    date: { type: Date, required: true, index: true },
    affiliateClicks: { type: Number, required: true, default: 0 },
    conversions: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 },
    epc: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: false,
  }
);

// Compound index for postId + date uniqueness
PostRevenueSchema.index({ postId: 1, date: 1 }, { unique: true });

export const PostRevenueModel: Model<IPostRevenueDocument> =
  mongoose.models.PostRevenue || mongoose.model<IPostRevenueDocument>('PostRevenue', PostRevenueSchema);

export default PostRevenueModel;
