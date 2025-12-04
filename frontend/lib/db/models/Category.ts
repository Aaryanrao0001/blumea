import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICategory } from '@/lib/types';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default Category;
