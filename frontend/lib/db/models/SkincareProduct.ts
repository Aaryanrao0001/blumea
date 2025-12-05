import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ISkincareProduct {
  _id: Types.ObjectId;
  name: string;
  brand: string;
  slug: string;
  category: "cleanser" | "moisturizer" | "serum" | "sunscreen" | "treatment" | "other";
  imageUrl: string;
  productUrl: string;
  affiliateLinks: { merchant: string; url: string; }[];
  ingredientListRaw: string;
  ingredientNames: string[];
  skinTypes: string[];
  price?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISkincareProductDocument extends Omit<ISkincareProduct, '_id'>, Document {}

const AffiliateLinkSchema = new Schema(
  {
    merchant: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const SkincareProductSchema = new Schema<ISkincareProductDocument>({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, enum: ["cleanser", "moisturizer", "serum", "sunscreen", "treatment", "other"], required: true },
  imageUrl: { type: String, required: true },
  productUrl: { type: String, required: true },
  affiliateLinks: [AffiliateLinkSchema],
  ingredientListRaw: { type: String, required: true },
  ingredientNames: [{ type: String }],
  skinTypes: [{ type: String }],
  price: { type: Number },
  currency: { type: String },
}, { timestamps: true });

// Index for text search
SkincareProductSchema.index({ name: 'text', brand: 'text' });

export const SkincareProduct: Model<ISkincareProductDocument> = mongoose.models.SkincareProduct || mongoose.model<ISkincareProductDocument>('SkincareProduct', SkincareProductSchema);
export default SkincareProduct;
