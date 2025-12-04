import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAuthor } from '@/lib/types';

export interface IAuthorDocument extends Omit<IAuthor, '_id'>, Document {}

const AuthorSchema = new Schema<IAuthorDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: { type: String },
    avatar: { type: String },
    social: {
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Author: Model<IAuthorDocument> =
  mongoose.models.Author ||
  mongoose.model<IAuthorDocument>('Author', AuthorSchema);

export default Author;
