import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITopicOpportunity {
  _id: Types.ObjectId;
  topicId?: Types.ObjectId;
  keyword: string;
  title: string;
  score: number; // 0-100 opportunity score
  redditMentions: number;
  redditSentiment: number;
  trendGrowth30d: number;
  searchVolumeIndicator: number;
  competitorStrength: number;
  paaQuestions: string[];
  relatedKeywords: string[];
  recommendedAction: "create_new" | "update_existing" | "ignore";
  status: "pending" | "actioned" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicOpportunityDocument extends Omit<ITopicOpportunity, '_id'>, Document {}

const TopicOpportunitySchema = new Schema<ITopicOpportunityDocument>({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  keyword: { type: String, required: true, index: true },
  title: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100, index: true },
  redditMentions: { type: Number, required: true, default: 0 },
  redditSentiment: { type: Number, required: true, min: 0, max: 1 },
  trendGrowth30d: { type: Number, required: true },
  searchVolumeIndicator: { type: Number, required: true, min: 0, max: 100 },
  competitorStrength: { type: Number, required: true, min: 0, max: 100 },
  paaQuestions: [{ type: String }],
  relatedKeywords: [{ type: String }],
  recommendedAction: { 
    type: String, 
    enum: ["create_new", "update_existing", "ignore"],
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "actioned", "dismissed"],
    required: true,
    default: "pending",
    index: true
  },
}, { timestamps: true });

// Index for querying by status and score
TopicOpportunitySchema.index({ status: 1, score: -1 });
TopicOpportunitySchema.index({ recommendedAction: 1 });

export const TopicOpportunity: Model<ITopicOpportunityDocument> = 
  mongoose.models.TopicOpportunity || mongoose.model<ITopicOpportunityDocument>('TopicOpportunity', TopicOpportunitySchema);

export default TopicOpportunity;
