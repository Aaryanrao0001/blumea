import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPostExperiment {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  type: "title" | "cta" | "hero" | "layout";
  variants: {
    key: string;
    title?: string;
    heroSubtitle?: string;
    ctaText?: string;
    assignedWeight: number;
  }[];
  startDate: Date;
  endDate?: Date;
  metrics: {
    [variantKey: string]: {
      impressions: number;
      clicks: number;
      conversions?: number;
    };
  };
  winningVariantKey?: string;
  status: "running" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostExperimentDocument extends Omit<IPostExperiment, '_id'>, Document {}

const VariantSchema = new Schema(
  {
    key: { type: String, required: true },
    title: { type: String },
    heroSubtitle: { type: String },
    ctaText: { type: String },
    assignedWeight: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const PostExperimentSchema = new Schema<IPostExperimentDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  type: { type: String, enum: ["title", "cta", "hero", "layout"], required: true },
  variants: [VariantSchema],
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date },
  metrics: { type: Schema.Types.Mixed, default: {} },
  winningVariantKey: { type: String },
  status: { type: String, enum: ["running", "completed"], required: true, default: "running" },
}, { timestamps: true });

// Index for querying active experiments
PostExperimentSchema.index({ status: 1, startDate: -1 });

export const PostExperiment: Model<IPostExperimentDocument> = mongoose.models.PostExperiment || mongoose.model<IPostExperimentDocument>('PostExperiment', PostExperimentSchema);
export default PostExperiment;
