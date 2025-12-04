import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITopic {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  ideaType: "trend" | "evergreen" | "update";
  source: "manual" | "google_trends" | "tiktok" | "reddit" | "other";
  trendScore: number;
  monetizationScore: number;
  difficultyScore?: number;
  status: "new" | "selected" | "used" | "rejected";
  relatedProductIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicDocument extends Omit<ITopic, '_id'>, Document {}

const TopicSchema = new Schema<ITopicDocument>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  primaryKeyword: { type: String, required: true },
  secondaryKeywords: [{ type: String }],
  ideaType: { type: String, enum: ["trend", "evergreen", "update"], required: true },
  source: { type: String, enum: ["manual", "google_trends", "tiktok", "reddit", "other"], required: true },
  trendScore: { type: Number, required: true, min: 0, max: 100 },
  monetizationScore: { type: Number, required: true, min: 0, max: 100 },
  difficultyScore: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ["new", "selected", "used", "rejected"], required: true, default: "new" },
  relatedProductIds: [{ type: Schema.Types.ObjectId, ref: 'SkincareProduct' }],
}, { timestamps: true });

// Index for querying by status and scores
TopicSchema.index({ status: 1, trendScore: -1 });

export const Topic: Model<ITopicDocument> = mongoose.models.Topic || mongoose.model<ITopicDocument>('Topic', TopicSchema);
export default Topic;
