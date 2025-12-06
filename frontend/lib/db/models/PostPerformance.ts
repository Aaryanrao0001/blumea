import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPostPerformance {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  successScore: number;
  engagementScore: number;
  seoScore: number;
  monetizationScore: number;
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostPerformanceDocument extends Omit<IPostPerformance, '_id'>, Document {}

const PostPerformanceSchema = new Schema<IPostPerformanceDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, unique: true, index: true },
  successScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
  engagementScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
  seoScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
  monetizationScore: { type: Number, required: true, default: 0, min: 0, max: 100 },
  lastCalculatedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

// Indexes for querying top/bottom performers
PostPerformanceSchema.index({ successScore: -1 });
PostPerformanceSchema.index({ engagementScore: -1 });
PostPerformanceSchema.index({ seoScore: -1 });
PostPerformanceSchema.index({ monetizationScore: -1 });

export const PostPerformance: Model<IPostPerformanceDocument> = mongoose.models.PostPerformance || mongoose.model<IPostPerformanceDocument>('PostPerformance', PostPerformanceSchema);
export default PostPerformance;
