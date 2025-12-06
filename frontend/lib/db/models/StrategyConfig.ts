import mongoose, { Schema, Document, Model } from 'mongoose';
import { StrategyConfig } from '@/lib/types';

export interface IStrategyConfigDocument extends Omit<StrategyConfig, '_id'>, Document {}

const StrategyConfigSchema = new Schema<IStrategyConfigDocument>(
  {
    weights: {
      engagement: { type: Number, required: true, default: 0.33 },
      seo: { type: Number, required: true, default: 0.33 },
      monetization: { type: Number, required: true, default: 0.34 },
    },
    topicPreferences: [
      {
        category: { type: String, required: true },
        weight: { type: Number, required: true, default: 1.0 },
      },
    ],
    contentRules: {
      introMaxWords: { type: Number, required: true, default: 150 },
      faqCount: { type: Number, required: true, default: 5 },
      useComparisonTable: { type: Boolean, required: true, default: true },
      comparisonTableProbability: { type: Number, required: true, default: 0.7 },
    },
    autoPublishEnabled: { type: Boolean, required: true, default: false },
    maxPostsPerDay: { type: Number, required: true, default: 3 },
    minSuccessScoreForRefresh: { type: Number, required: true, default: 50 },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false,
  }
);

export const StrategyConfigModel: Model<IStrategyConfigDocument> =
  mongoose.models.StrategyConfig || mongoose.model<IStrategyConfigDocument>('StrategyConfig', StrategyConfigSchema);

export default StrategyConfigModel;
