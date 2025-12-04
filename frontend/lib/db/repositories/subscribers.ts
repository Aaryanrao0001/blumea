import { connectToDatabase } from '../mongoose';
import Subscriber from '../models/Subscriber';
import { ISubscriber } from '@/lib/types';

export async function createSubscriber(email: string): Promise<ISubscriber> {
  await connectToDatabase();
  
  const existingSubscriber = await Subscriber.findOne({ email });
  
  if (existingSubscriber) {
    if (!existingSubscriber.isActive) {
      existingSubscriber.isActive = true;
      await existingSubscriber.save();
      return existingSubscriber.toObject() as unknown as ISubscriber;
    }
    throw new Error('Email already subscribed');
  }
  
  const subscriber = await Subscriber.create({
    email,
    subscribedAt: new Date(),
    isActive: true,
  });
  
  return subscriber.toObject() as unknown as ISubscriber;
}

export async function unsubscribe(email: string): Promise<boolean> {
  await connectToDatabase();
  
  const result = await Subscriber.updateOne(
    { email },
    { isActive: false }
  );
  
  return result.modifiedCount > 0;
}

export async function getAllActiveSubscribers(): Promise<ISubscriber[]> {
  await connectToDatabase();
  const subscribers = await Subscriber.find({ isActive: true }).lean();
  return subscribers as unknown as ISubscriber[];
}
