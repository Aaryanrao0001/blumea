import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPost, Post as PostPhase3 } from '@/lib/types';

// Legacy document interface - for backwards compatibility
export interface IPostDocument extends Omit<IPost, '_id'>, Document {}

// Phase 3 document interface
export interface IPostPhase3Document extends Omit<PostPhase3, '_id'>, Document {}

const CoverImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const ImageSlotSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const InlineImageSchema = new Schema(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    alt: { type: String, required: true },
    caption: { type: String },
  },
  { _id: false }
);

const CriteriaRatingSchema = new Schema(
  {
    label: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false }
);

const PostSchema = new Schema<IPostDocument>(
  {
    // Phase 3: Origin & workflow
    source: { type: String, enum: ['ai', 'manual', 'mixed'], default: 'manual' },
    status: { type: String, enum: ['draft', 'lab', 'scheduled', 'published', 'archived'], default: 'draft', index: true },
    postType: { type: String, enum: ['blog', 'review'], required: true, index: true },

    // Core
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    // Phase 3: SEO
    seoTitle: { type: String },
    seoDescription: { type: String },
    canonicalUrl: { type: String },

    // Phase 3: Classification (slug-based)
    categorySlug: { type: String },
    tagSlugs: [{ type: String }],

    // Phase 3: Content
    excerpt: { type: String, required: true },
    bodyFormat: { type: String, enum: ['markdown', 'richtext'], default: 'markdown' },
    bodyRaw: { type: String, required: true },
    wordCount: { type: Number },

    // Phase 3: Multi-slot images
    images: {
      featured: { type: ImageSlotSchema },
      card: { type: ImageSlotSchema },
      popularSlider: { type: ImageSlotSchema },
      inline: [InlineImageSchema],
    },

    // Phase 3: Review-specific fields (nested)
    review: {
      productIds: [{ type: Schema.Types.ObjectId, ref: 'SkincareProduct' }],
      overallRating: { type: Number, min: 1, max: 5 },
      criteriaRatings: [CriteriaRatingSchema],
      pros: [{ type: String }],
      cons: [{ type: String }],
      verdict: { type: String },
    },

    // Phase 3: AI / topic metadata
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    aiGenerationMeta: {
      claudeModel: { type: String },
      generatedAt: { type: Date },
    },

    // Dates
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: 'admin' },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, index: true },
    scheduledFor: { type: Date },

    // Flags
    isFeatured: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },

    // Legacy fields (for backwards compatibility - kept for existing queries)
    type: { type: String, enum: ['blog', 'review'] },
    body: { type: String },
    coverImage: { type: CoverImageSchema },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    readingTime: { type: Number },
    productName: { type: String },
    brand: { type: String },
    overallRating: { type: Number, min: 1, max: 5 },
    criteriaRatings: [CriteriaRatingSchema],
    pros: [{ type: String }],
    cons: [{ type: String }],
    verdict: { type: String },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
PostSchema.index({ title: 'text', excerpt: 'text', bodyRaw: 'text' });

export const Post: Model<IPostDocument> =
  mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);

export default Post;
