import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGeneratedDraft {
  _id: Types.ObjectId;
  topicId: Types.ObjectId;
  productIds: Types.ObjectId[];
  postType: "blog" | "review";
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  categorySlug: string;
  tagSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  schemaJson: object;
  faq: { question: string; answer: string }[];
  outline: string[];
  bodyRaw: string;
  wordCount: number;
  status: "draft" | "approved" | "rejected" | "published";
  createdBy: "system" | "admin";
  createdAt: Date;
  updatedAt: Date;
  publishedPostId?: Types.ObjectId;
}

export interface IGeneratedDraftDocument extends Omit<IGeneratedDraft, '_id'>, Document {}

const FaqSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const GeneratedDraftSchema = new Schema<IGeneratedDraftDocument>({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  productIds: [{ type: Schema.Types.ObjectId, ref: 'SkincareProduct' }],
  postType: { type: String, enum: ["blog", "review"], required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  coverImageUrl: { type: String },
  categorySlug: { type: String, required: true },
  tagSlugs: [{ type: String }],
  seoTitle: { type: String, required: true },
  seoDescription: { type: String, required: true },
  schemaJson: { type: Schema.Types.Mixed, default: {} },
  faq: [FaqSchema],
  outline: [{ type: String }],
  bodyRaw: { type: String, required: true },
  wordCount: { type: Number, required: true },
  status: { type: String, enum: ["draft", "approved", "rejected", "published"], required: true, default: "draft" },
  createdBy: { type: String, enum: ["system", "admin"], required: true, default: "system" },
  publishedPostId: { type: Schema.Types.ObjectId, ref: 'Post' },
}, { timestamps: true });

// Index for querying by status
GeneratedDraftSchema.index({ status: 1, createdAt: -1 });

export const GeneratedDraft: Model<IGeneratedDraftDocument> = mongoose.models.GeneratedDraft || mongoose.model<IGeneratedDraftDocument>('GeneratedDraft', GeneratedDraftSchema);
export default GeneratedDraft;
