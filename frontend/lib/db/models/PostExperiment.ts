import mongoose, { Schema, Document, Model } from 'mongoose';
import { PostExperiment, ExperimentVariant } from '@/lib/types';

export interface IExperimentVariantDocument extends ExperimentVariant, Document {}
export interface IPostExperimentDocument extends Omit<PostExperiment, '_id'>, Document {}

const ExperimentVariantSchema = new Schema<IExperimentVariantDocument>(
  {
    variantId: { type: String, required: true },
    value: { type: String, required: true },
    impressions: { type: Number, required: true, default: 0 },
    clicks: { type: Number, required: true, default: 0 },
    conversions: { type: Number, required: true, default: 0 },
    engagementTime: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const PostExperimentSchema = new Schema<IPostExperimentDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    experimentType: {
      type: String,
      enum: ["title", "cta", "intro"],
      required: true,
    },
    status: {
      type: String,
      enum: ["running", "concluded", "cancelled"],
      default: "running",
      required: true,
    },
    variants: [ExperimentVariantSchema],
    winnerVariantId: { type: String },
    startedAt: { type: Date, required: true, default: Date.now },
    concludedAt: { type: Date },
    minImpressionsPerVariant: { type: Number, required: true, default: 1000 },
    confidenceThreshold: { type: Number, required: true, default: 0.95 },
  },
  {
    timestamps: true,
  }
);

// Index for finding experiments by post and status
PostExperimentSchema.index({ postId: 1, status: 1 });

export const PostExperimentModel: Model<IPostExperimentDocument> =
  mongoose.models.PostExperiment || mongoose.model<IPostExperimentDocument>('PostExperiment', PostExperimentSchema);

export default PostExperimentModel;
