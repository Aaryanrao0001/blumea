import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IStrategyConfig {
  _id: Types.ObjectId;
  version: number;
  weights: {
    engagement: number;
    seo: number;
    monetization: number;
  };
  topicPreferences: {
    acneWeight: number;
    antiAgingWeight: number;
    sunscreenWeight: number;
    barrierRepairWeight: number;
    [key: string]: number;
  };
  contentRules: {
    introMaxWords: number;
    includeComparisonTableProbability: number;
    includeRoutineSectionProbability: number;
    faqCount: number;
  };
  autoPublishEnabled: boolean;
  minSuccessScoreForRefresh: number;
  maxPostsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStrategyConfigDocument extends Omit<IStrategyConfig, '_id'>, Document {}

const StrategyConfigSchema = new Schema<IStrategyConfigDocument>({
  version: { type: Number, required: true, unique: true },
  weights: {
    engagement: { type: Number, required: true, min: 0, max: 1 },
    seo: { type: Number, required: true, min: 0, max: 1 },
    monetization: { type: Number, required: true, min: 0, max: 1 },
  },
  topicPreferences: { type: Schema.Types.Mixed, required: true },
  contentRules: {
    introMaxWords: { type: Number, required: true },
    includeComparisonTableProbability: { type: Number, required: true, min: 0, max: 1 },
    includeRoutineSectionProbability: { type: Number, required: true, min: 0, max: 1 },
    faqCount: { type: Number, required: true },
  },
  autoPublishEnabled: { type: Boolean, required: true, default: false },
  minSuccessScoreForRefresh: { type: Number, required: true, min: 0, max: 100, default: 50 },
  maxPostsPerDay: { type: Number, required: true, default: 3 },
}, { timestamps: true });

// Index for querying latest version
StrategyConfigSchema.index({ version: -1 });

export const StrategyConfig: Model<IStrategyConfigDocument> = mongoose.models.StrategyConfig || mongoose.model<IStrategyConfigDocument>('StrategyConfig', StrategyConfigSchema);
export default StrategyConfig;
