import { connectToDatabase } from '../mongoose';
import PostRevenueModel from '../models/PostRevenue';
import { PostRevenue } from '@/lib/types';
import { Types } from 'mongoose';

export async function createRevenue(data: Omit<PostRevenue, '_id'>): Promise<PostRevenue> {
  await connectToDatabase();
  const revenue = await PostRevenueModel.create(data);
  return revenue.toObject() as PostRevenue;
}

export async function getRevenueByPostId(
  postId: string | Types.ObjectId,
  startDate?: Date,
  endDate?: Date
): Promise<PostRevenue[]> {
  await connectToDatabase();
  
  const query: Record<string, unknown> = { postId: new Types.ObjectId(postId.toString()) };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) (query.date as Record<string, unknown>).$gte = startDate;
    if (endDate) (query.date as Record<string, unknown>).$lte = endDate;
  }
  
  const revenue = await PostRevenueModel.find(query).sort({ date: -1 }).lean();
  return revenue as PostRevenue[];
}

export async function upsertRevenue(data: Omit<PostRevenue, '_id'>): Promise<PostRevenue> {
  await connectToDatabase();
  
  const revenue = await PostRevenueModel.findOneAndUpdate(
    { postId: data.postId, date: data.date },
    data,
    { upsert: true, new: true }
  ).lean();
  
  return revenue as PostRevenue;
}

export async function getLatestRevenue(postId: string | Types.ObjectId): Promise<PostRevenue | null> {
  await connectToDatabase();
  
  const revenue = await PostRevenueModel.findOne({ postId: new Types.ObjectId(postId.toString()) })
    .sort({ date: -1 })
    .lean();
  
  return revenue as PostRevenue | null;
}
