import mongoose, { Schema, Document, Model } from 'mongoose';
import { StrategyConfig } from '@/lib/types';

export interface IStrategyConfigDocument extends Omit<StrategyConfig, '_id'>, Document {}

const StrategyConfigSchema = new Schema<IStrategyConfigDocument>(
  {
    version: { type: Number, default: 1 },
    
    weights: {
      engagement: { type: Number, required: true, default: 0.33 },
      seo: { type: Number, required: true, default: 0.33 },
      monetization: { type: Number, required: true, default: 0.34 },
    },
    
    // Content volume
    contentVolume: {
      maxPostsPerDay: { type: Number, default: 5 },
      minPostsPerDay: { type: Number, default: 1 },
      maxPostsPerWeek: { type: Number, default: 21 },
      perType: {
        blog: {
          minPerWeek: { type: Number, default: 3 },
          maxPerWeek: { type: Number, default: 10 },
        },
        review: {
          minPerWeek: { type: Number, default: 2 },
          maxPerWeek: { type: Number, default: 7 },
        },
        comparison: {
          minPerWeek: { type: Number, default: 1 },
          maxPerWeek: { type: Number, default: 4 },
        },
      },
      perCategory: { type: Map, of: { targetShare: Number } },
    },
    
    // Scheduling
    scheduling: {
      primaryTimezone: { type: String, default: "America/New_York" },
      timeSlots: [
        {
          slotId: String,
          daysOfWeek: [Number],
          startHour: Number,
          endHour: Number,
          priorityFor: [{ type: String, enum: ["blog", "review"] }],
        },
      ],
      bestTimesByCategory: {
        type: Map,
        of: [
          {
            dayOfWeek: Number,
            hour: Number,
            confidence: Number,
          },
        ],
      },
    },
    
    topicPreferences: [
      {
        category: { type: String, required: true },
        weight: { type: Number, required: true, default: 1.0 },
      },
    ],
    topicPreferencesByCategory: { type: Map, of: Number },
    topicPreferencesByFormat: {
      routineGuide: { type: Number, default: 1.0 },
      comparison: { type: Number, default: 1.0 },
      deepDive: { type: Number, default: 1.0 },
      quickTips: { type: Number, default: 1.0 },
      listicle: { type: Number, default: 1.0 },
    },
    
    contentRules: {
      introMaxWords: { type: Number, required: true, default: 150 },
      faqCount: { type: Number, required: true, default: 5 },
      useComparisonTable: { type: Boolean, required: true, default: true },
      comparisonTableProbability: { type: Number, required: true, default: 0.7 },
      bodyTargetWordCount: {
        blog: { type: Number, default: 1500 },
        review: { type: Number, default: 2000 },
        comparison: { type: Number, default: 2500 },
        deepDive: { type: Number, default: 3000 },
      },
      includeRoutineSectionProbability: { type: Number, default: 0.5 },
      toneVariants: {
        calm_explainer: { type: Number, default: 0.6 },
        slightly_playful: { type: Number, default: 0.3 },
        clinical: { type: Number, default: 0.1 },
      },
    },
    
    // Safety
    safety: {
      autoPublishEnabled: { type: Boolean, default: false },
      requireManualReviewForCategories: [String],
      maxPostsPerDayAuto: { type: Number, default: 2 },
      maxRiskTopicsPerWeek: { type: Number, default: 3 },
    },
    
    // Experiments
    experiments: {
      enableTitleABTest: { type: Boolean, default: false },
      enableCTAABTest: { type: Boolean, default: false },
      minImpressionsForDecision: { type: Number, default: 1000 },
    },
    
    // Refresh policy
    refreshPolicy: {
      enableAutoRefresh: { type: Boolean, default: false },
      minDaysOld: { type: Number, default: 90 },
      minTrafficForRefresh: { type: Number, default: 100 },
      decayThreshold: { type: Number, default: 0.3 },
    },
    
    // Legacy fields
    autoPublishEnabled: { type: Boolean, required: true, default: false },
    maxPostsPerDay: { type: Number, required: true, default: 3 },
    minSuccessScoreForRefresh: { type: Number, required: true, default: 50 },
    // Note: updatedAt is handled by timestamps: true option
  },
  {
    timestamps: true,
  }
);

export const StrategyConfigModel: Model<IStrategyConfigDocument> =
  mongoose.models.StrategyConfig || mongoose.model<IStrategyConfigDocument>('StrategyConfig', StrategyConfigSchema);

export default StrategyConfigModel;
