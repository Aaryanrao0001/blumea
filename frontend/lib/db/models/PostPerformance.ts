import mongoose, { Schema, Document, Model } from 'mongoose';
import { PostPerformance } from '@/lib/types';

export interface IPostPerformanceDocument extends Omit<PostPerformance, '_id'>, Document {}

const PostPerformanceSchema = new Schema<IPostPerformanceDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    window: { type: String, enum: ["7d", "30d", "90d"], default: "30d" },
    
    successScore: { type: Number, required: true, default: 0 },
    engagementScore: { type: Number, required: true, default: 0 },
    seoScore: { type: Number, required: true, default: 0 },
    monetizationScore: { type: Number, required: true, default: 0 },
    
    // Diagnostics
    mainWeakness: {
      type: String,
      enum: ["traffic", "engagement", "conversion", "seo", "none"],
    },
    mainStrength: {
      type: String,
      enum: ["traffic", "engagement", "conversion", "seo", "none"],
    },
    
    lastCalculated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index for postId + window
PostPerformanceSchema.index({ postId: 1, window: 1 }, { unique: true });

export const PostPerformanceModel: Model<IPostPerformanceDocument> =
  mongoose.models.PostPerformance || mongoose.model<IPostPerformanceDocument>('PostPerformance', PostPerformanceSchema);

export default PostPerformanceModel;
