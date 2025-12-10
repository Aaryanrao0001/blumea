import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IStrategyRecommendation {
  type: 'create_content' | 'refresh_content' | 'target_keyword' | 'avoid_topic';
  description: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  dataPoints: string[];
}

export interface IStrategyHistory {
  _id: Types.ObjectId;
  reportDate: Date;
  weekStart: Date;
  weekEnd: Date;
  totalOpportunities: number;
  avgOpportunityScore: number;
  topKeywords: string[];
  topTrendingIngredients: string[];
  redditBuzzScore: number;
  summary: string;
  weeklyTrends: string[];
  emergingTopics: string[];
  recommendations: IStrategyRecommendation[];
  competitorInsights: string[];
  whatToAvoid: { topic: string; reason: string }[];
  comparedToLastWeek?: {
    improved: string[];
    declined: string[];
    unchanged: string[];
    opportunityScoreChange: number;
    previousReportId?: Types.ObjectId;
  };
  fullReportMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStrategyHistoryDocument extends Omit<IStrategyHistory, '_id'>, Document {}

const RecommendationSchema = new Schema({
  type: { type: String, enum: ['create_content', 'refresh_content', 'target_keyword', 'avoid_topic'], required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
  reasoning: { type: String, required: true },
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  dataPoints: [{ type: String }],
}, { _id: false });

const StrategyHistorySchema = new Schema<IStrategyHistoryDocument>({
  reportDate: { type: Date, required: true, default: Date.now },
  weekStart: { type: Date, required: true, index: true },
  weekEnd: { type: Date, required: true },
  totalOpportunities: { type: Number, required: true, default: 0 },
  avgOpportunityScore: { type: Number, required: true, default: 0 },
  topKeywords: [{ type: String }],
  topTrendingIngredients: [{ type: String }],
  redditBuzzScore: { type: Number, default: 0 },
  summary: { type: String, required: true },
  weeklyTrends: [{ type: String }],
  emergingTopics: [{ type: String }],
  recommendations: [RecommendationSchema],
  competitorInsights: [{ type: String }],
  whatToAvoid: [{
    topic: { type: String },
    reason: { type: String },
  }],
  comparedToLastWeek: {
    improved: [{ type: String }],
    declined: [{ type: String }],
    unchanged: [{ type: String }],
    opportunityScoreChange: { type: Number },
    previousReportId: { type: Schema.Types.ObjectId, ref: 'StrategyHistory' },
  },
  fullReportMarkdown: { type: String, required: true },
}, { timestamps: true });

StrategyHistorySchema.index({ weekStart: -1 });

export const StrategyHistory: Model<IStrategyHistoryDocument> = 
  mongoose.models.StrategyHistory || mongoose.model<IStrategyHistoryDocument>('StrategyHistory', StrategyHistorySchema);

export default StrategyHistory;
