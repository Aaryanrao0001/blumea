import mongoose, { Schema, Document, Model } from 'mongoose';
import { PostMetrics } from '@/lib/types';

export interface IPostMetricsDocument extends Omit<PostMetrics, '_id'>, Document {}

const PostMetricsSchema = new Schema<IPostMetricsDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    date: { type: Schema.Types.Mixed, required: true, index: true }, // String or Date

    // Traffic
    pageViews: { type: Number, required: true, default: 0 },
    uniqueVisitors: { type: Number, required: true, default: 0 },
    sessions: { type: Number, default: 0 },

    // Engagement
    avgTimeOnPage: { type: Number, default: 0 }, // deprecated
    avgEngagedTime: { type: Number, default: 0 }, // GA4 engagement time
    bounceRate: { type: Number, required: true, default: 0 },
    scrollDepthAvg: { type: Number, required: true, default: 0 },
    scrollDepthP75: { type: Number, default: 0 },
    exitsFromPage: { type: Number, default: 0 },
    socialShares: { type: Number, default: 0 },

    // Devices & geo
    mobileShare: { type: Number, default: 0 },
    desktopShare: { type: Number, default: 0 },
    topCountries: [
      {
        countryCode: { type: String },
        share: { type: Number },
      },
    ],

    // Acquisition
    byChannel: [
      {
        channel: {
          type: String,
          enum: ["organic_search", "social", "direct", "email", "referral", "paid"],
        },
        sessions: { type: Number },
      },
    ],

    // SEO (from Search Console)
    searchImpressions: { type: Number },
    searchClicks: { type: Number },
    searchCtr: { type: Number },
    avgPosition: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Compound index for postId + date uniqueness
PostMetricsSchema.index({ postId: 1, date: 1 }, { unique: true });

export const PostMetricsModel: Model<IPostMetricsDocument> =
  mongoose.models.PostMetrics || mongoose.model<IPostMetricsDocument>('PostMetrics', PostMetricsSchema);

export default PostMetricsModel;
