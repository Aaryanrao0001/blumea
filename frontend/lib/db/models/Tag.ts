import mongoose, { Schema, Document, Model } from 'mongoose';
import { ITag } from '@/lib/types';

export interface ITagDocument extends Omit<ITag, '_id'>, Document {}

const TagSchema = new Schema<ITagDocument>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export const Tag: Model<ITagDocument> =
  mongoose.models.Tag || mongoose.model<ITagDocument>('Tag', TagSchema);

export default Tag;
