import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPostRevenue {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  date: string;
  affiliateClicks: number;
  affiliateConversions: number;
  revenue: number;
  epc: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostRevenueDocument extends Omit<IPostRevenue, '_id'>, Document {}

const PostRevenueSchema = new Schema<IPostRevenueDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  date: { type: String, required: true, index: true },
  affiliateClicks: { type: Number, required: true, default: 0 },
  affiliateConversions: { type: Number, required: true, default: 0 },
  revenue: { type: Number, required: true, default: 0 },
  epc: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Compound index for unique postId + date
PostRevenueSchema.index({ postId: 1, date: 1 }, { unique: true });

export const PostRevenue: Model<IPostRevenueDocument> = mongoose.models.PostRevenue || mongoose.model<IPostRevenueDocument>('PostRevenue', PostRevenueSchema);
export default PostRevenue;
