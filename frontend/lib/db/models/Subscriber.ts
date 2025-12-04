import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISubscriber } from '@/lib/types';

export interface ISubscriberDocument extends Omit<ISubscriber, '_id'>, Document {}

const SubscriberSchema = new Schema<ISubscriberDocument>(
  {
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Subscriber: Model<ISubscriberDocument> =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriberDocument>('Subscriber', SubscriberSchema);

export default Subscriber;
