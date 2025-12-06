import mongoose, { Schema, Document, Model } from 'mongoose';
import { PostPerformance } from '@/lib/types';

export interface IPostPerformanceDocument extends Omit<PostPerformance, '_id'>, Document {}

const PostPerformanceSchema = new Schema<IPostPerformanceDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, unique: true, index: true },
    successScore: { type: Number, required: true, default: 0 },
    engagementScore: { type: Number, required: true, default: 0 },
    seoScore: { type: Number, required: true, default: 0 },
    monetizationScore: { type: Number, required: true, default: 0 },
    lastCalculated: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false,
  }
);

export const PostPerformanceModel: Model<IPostPerformanceDocument> =
  mongoose.models.PostPerformance || mongoose.model<IPostPerformanceDocument>('PostPerformance', PostPerformanceSchema);

export default PostPerformanceModel;
