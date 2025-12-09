import mongoose, { Schema, Document, Model } from 'mongoose';
import { ContentPlan, ContentPlanItem } from '@/lib/types';

export interface IContentPlanItemDocument extends Omit<ContentPlanItem, '_id'>, Document {}
export interface IContentPlanDocument extends Omit<ContentPlan, '_id'>, Document {}

const ContentPlanItemSchema = new Schema<IContentPlanItemDocument>(
  {
    scheduledDateTime: { type: Date, required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    postType: {
      type: String,
      enum: ["blog", "review", "comparison"],
      required: true,
    },
    categorySlug: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed", "skipped"],
      default: "planned",
      required: true,
    },
    generatedDraftId: { type: Schema.Types.ObjectId, ref: 'GeneratedDraft' },
    publishedPostId: { type: Schema.Types.ObjectId, ref: 'Post' },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const ContentPlanSchema = new Schema<IContentPlanDocument>(
  {
    weekStart: { type: Date, required: true, index: true },
    weekEnd: { type: Date, required: true },
    items: [ContentPlanItemSchema],
    totalPlanned: { type: Number, required: true, default: 0 },
    totalCompleted: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for finding plans by week
ContentPlanSchema.index({ weekStart: 1 }, { unique: true });

export const ContentPlanModel: Model<IContentPlanDocument> =
  mongoose.models.ContentPlan || mongoose.model<IContentPlanDocument>('ContentPlan', ContentPlanSchema);

export default ContentPlanModel;
