import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IContentJob {
  _id: Types.ObjectId;
  topicId: Types.ObjectId;
  targetPostType: "review" | "comparison" | "guide" | "ingredient_deep_dive";
  status: "pending" | "running" | "failed" | "completed";
  claudeModel: string;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentJobDocument extends Omit<IContentJob, '_id'>, Document {}

const ContentJobSchema = new Schema<IContentJobDocument>({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  targetPostType: { type: String, enum: ["review", "comparison", "guide", "ingredient_deep_dive"], required: true },
  status: { type: String, enum: ["pending", "running", "failed", "completed"], required: true, default: "pending" },
  claudeModel: { type: String, required: true, default: "claude-sonnet-4-20250514" },
  scheduledFor: { type: Date, required: true, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  errorMessage: { type: String },
}, { timestamps: true });

// Index for querying pending jobs
ContentJobSchema.index({ status: 1, scheduledFor: 1 });

export const ContentJob: Model<IContentJobDocument> = mongoose.models.ContentJob || mongoose.model<IContentJobDocument>('ContentJob', ContentJobSchema);
export default ContentJob;
