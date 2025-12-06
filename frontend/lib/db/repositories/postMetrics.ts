import { connectToDatabase } from '../mongoose';
import PostMetrics from '../models/PostMetrics';
import { IPostMetrics } from '@/lib/types';

export async function upsertDailyMetrics(
  postId: string,
  date: string,
  metrics: Omit<IPostMetrics, '_id' | 'postId' | 'date' | 'createdAt' | 'updatedAt'>
): Promise<IPostMetrics> {
  await connectToDatabase();
  const result = await PostMetrics.findOneAndUpdate(
    { postId, date },
    { $set: metrics },
    { upsert: true, new: true }
  ).lean();
  return result as unknown as IPostMetrics;
}

export async function getMetricsByPostId(postId: string): Promise<IPostMetrics[]> {
  await connectToDatabase();
  const metrics = await PostMetrics.find({ postId }).sort({ date: -1 }).lean();
  return metrics as unknown as IPostMetrics[];
}

export async function getMetricsByDateRange(
  startDate: string,
  endDate: string
): Promise<IPostMetrics[]> {
  await connectToDatabase();
  const metrics = await PostMetrics.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 }).lean();
  return metrics as unknown as IPostMetrics[];
}

export async function getMetricsByPostIdAndDateRange(
  postId: string,
  startDate: string,
  endDate: string
): Promise<IPostMetrics[]> {
  await connectToDatabase();
  const metrics = await PostMetrics.find({
    postId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 }).lean();
  return metrics as unknown as IPostMetrics[];
}

export async function getLatestMetricsByPostId(postId: string): Promise<IPostMetrics | null> {
  await connectToDatabase();
  const metric = await PostMetrics.findOne({ postId }).sort({ date: -1 }).lean();
  return metric as unknown as IPostMetrics | null;
}
