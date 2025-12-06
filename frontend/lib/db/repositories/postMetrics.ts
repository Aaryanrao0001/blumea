import { connectToDatabase } from '../mongoose';
import PostMetricsModel from '../models/PostMetrics';
import { PostMetrics } from '@/lib/types';
import { Types } from 'mongoose';

export async function createMetrics(data: Omit<PostMetrics, '_id'>): Promise<PostMetrics> {
  await connectToDatabase();
  const metrics = await PostMetricsModel.create(data);
  return metrics.toObject() as PostMetrics;
}

export async function getMetricsByPostId(
  postId: string | Types.ObjectId,
  startDate?: Date,
  endDate?: Date
): Promise<PostMetrics[]> {
  await connectToDatabase();
  
  const query: Record<string, unknown> = { postId: new Types.ObjectId(postId.toString()) };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) (query.date as Record<string, unknown>).$gte = startDate;
    if (endDate) (query.date as Record<string, unknown>).$lte = endDate;
  }
  
  const metrics = await PostMetricsModel.find(query).sort({ date: -1 }).lean();
  return metrics as PostMetrics[];
}

export async function upsertMetrics(data: Omit<PostMetrics, '_id'>): Promise<PostMetrics> {
  await connectToDatabase();
  
  const metrics = await PostMetricsModel.findOneAndUpdate(
    { postId: data.postId, date: data.date },
    data,
    { upsert: true, new: true }
  ).lean();
  
  return metrics as PostMetrics;
}

export async function getLatestMetrics(postId: string | Types.ObjectId): Promise<PostMetrics | null> {
  await connectToDatabase();
  
  const metrics = await PostMetricsModel.findOne({ postId: new Types.ObjectId(postId.toString()) })
    .sort({ date: -1 })
    .lean();
  
  return metrics as PostMetrics | null;
}
