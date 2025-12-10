import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRedditInsight {
  _id: Types.ObjectId;
  postId: string;
  subreddit: string;
  title: string;
  body: string;
  upvotes: number;
  comments: number;
  sentiment: number; // 0-1 score from Claude
  keywords: string[];
  productsMentioned: string[];
  ingredientsMentioned: string[];
  intentType: "problem" | "review" | "ingredient_confusion" | "routine_help" | "viral_product" | "fail_story";
  permalink: string;
  timestamp: Date;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRedditInsightDocument extends Omit<IRedditInsight, '_id'>, Document {}

const RedditInsightSchema = new Schema<IRedditInsightDocument>({
  postId: { type: String, required: true, unique: true },
  subreddit: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  upvotes: { type: Number, required: true, default: 0 },
  comments: { type: Number, required: true, default: 0 },
  sentiment: { type: Number, required: true, min: 0, max: 1 },
  keywords: [{ type: String }],
  productsMentioned: [{ type: String }],
  ingredientsMentioned: [{ type: String }],
  intentType: { 
    type: String, 
    enum: ["problem", "review", "ingredient_confusion", "routine_help", "viral_product", "fail_story"],
    required: true 
  },
  permalink: { type: String, required: true },
  timestamp: { type: Date, required: true },
  processedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

// Index for querying by subreddit and sentiment
RedditInsightSchema.index({ subreddit: 1, sentiment: -1 });
RedditInsightSchema.index({ timestamp: -1 });
RedditInsightSchema.index({ intentType: 1 });

export const RedditInsight: Model<IRedditInsightDocument> = 
  mongoose.models.RedditInsight || mongoose.model<IRedditInsightDocument>('RedditInsight', RedditInsightSchema);

export default RedditInsight;
