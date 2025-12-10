import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISerpInsight {
  _id: Types.ObjectId;
  keyword: string;
  searchResults: {
    position: number;
    url: string;
    title: string;
    description: string;
    domain: string;
  }[];
  peopleAlsoAsk: { question: string; snippet: string }[];
  relatedSearches: string[];
  autocomplete: string[];
  featuredSnippet?: { type: string; content: string };
  lastScraped: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISerpInsightDocument extends Omit<ISerpInsight, '_id'>, Document {}

const SerpInsightSchema = new Schema<ISerpInsightDocument>({
  keyword: { type: String, required: true, unique: true, index: true },
  searchResults: [{
    position: { type: Number, required: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    domain: { type: String, required: true }
  }],
  peopleAlsoAsk: [{
    question: { type: String, required: true },
    snippet: { type: String, required: true }
  }],
  relatedSearches: [{ type: String }],
  autocomplete: [{ type: String }],
  featuredSnippet: {
    type: { type: String },
    content: { type: String }
  },
  lastScraped: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

// Index for querying by last scraped date
SerpInsightSchema.index({ lastScraped: -1 });

export const SerpInsight: Model<ISerpInsightDocument> = 
  mongoose.models.SerpInsight || mongoose.model<ISerpInsightDocument>('SerpInsight', SerpInsightSchema);

export default SerpInsight;
