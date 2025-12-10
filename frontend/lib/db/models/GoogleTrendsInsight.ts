import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IGoogleTrendsInsight {
  _id: Types.ObjectId;
  keyword: string;
  timeRange: "today 1-m" | "today 3-m" | "today 12-m";
  interestOverTime: { date: string; score: number }[];
  relatedQueries: { keyword: string; type: "rising" | "top"; score: number }[];
  relatedTopics: { topic: string; score: number }[];
  trendDirection: "rising" | "falling" | "stable";
  projected30dGrowth: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoogleTrendsInsightDocument extends Omit<IGoogleTrendsInsight, '_id'>, Document {}

const GoogleTrendsInsightSchema = new Schema<IGoogleTrendsInsightDocument>({
  keyword: { type: String, required: true, index: true },
  timeRange: { 
    type: String, 
    enum: ["today 1-m", "today 3-m", "today 12-m"],
    required: true 
  },
  interestOverTime: [{
    date: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 }
  }],
  relatedQueries: [{
    keyword: { type: String, required: true },
    type: { type: String, enum: ["rising", "top"], required: true },
    score: { type: Number, required: true }
  }],
  relatedTopics: [{
    topic: { type: String, required: true },
    score: { type: Number, required: true }
  }],
  trendDirection: { 
    type: String, 
    enum: ["rising", "falling", "stable"],
    required: true 
  },
  projected30dGrowth: { type: Number, required: true },
  lastUpdated: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

// Compound index for unique keyword + timeRange
GoogleTrendsInsightSchema.index({ keyword: 1, timeRange: 1 }, { unique: true });
GoogleTrendsInsightSchema.index({ trendDirection: 1, projected30dGrowth: -1 });
GoogleTrendsInsightSchema.index({ lastUpdated: -1 });

export const GoogleTrendsInsight: Model<IGoogleTrendsInsightDocument> = 
  mongoose.models.GoogleTrendsInsight || mongoose.model<IGoogleTrendsInsightDocument>('GoogleTrendsInsight', GoogleTrendsInsightSchema);

export default GoogleTrendsInsight;
