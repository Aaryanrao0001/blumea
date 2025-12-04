import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProductScore {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  overallScore: number;
  beneficialScore: number;
  harmfulPenalty: number;
  concentrationScore: number;
  evidenceScore: number;
  skinTypeCompatibility: { [skinType: string]: number };
  pros: string[];
  cons: string[];
  bestFor: string[];
  avoidIf: string[];
  lastCalculatedAt: Date;
  createdAt: Date;
}

export interface IProductScoreDocument extends Omit<IProductScore, '_id'>, Document {}

const ProductScoreSchema = new Schema<IProductScoreDocument>({
  productId: { type: Schema.Types.ObjectId, ref: 'SkincareProduct', required: true, unique: true },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  beneficialScore: { type: Number, required: true },
  harmfulPenalty: { type: Number, required: true },
  concentrationScore: { type: Number, required: true },
  evidenceScore: { type: Number, required: true },
  skinTypeCompatibility: { type: Schema.Types.Mixed, default: {} },
  pros: [{ type: String }],
  cons: [{ type: String }],
  bestFor: [{ type: String }],
  avoidIf: [{ type: String }],
  lastCalculatedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

export const ProductScore: Model<IProductScoreDocument> = mongoose.models.ProductScore || mongoose.model<IProductScoreDocument>('ProductScore', ProductScoreSchema);
export default ProductScore;
