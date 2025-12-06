import { connectToDatabase } from '../mongoose';
import PostRevenue from '../models/PostRevenue';
import { IPostRevenue } from '@/lib/types';

export async function upsertDailyRevenue(
  postId: string,
  date: string,
  revenue: Omit<IPostRevenue, '_id' | 'postId' | 'date' | 'createdAt' | 'updatedAt'>
): Promise<IPostRevenue> {
  await connectToDatabase();
  const result = await PostRevenue.findOneAndUpdate(
    { postId, date },
    { $set: revenue },
    { upsert: true, new: true }
  ).lean();
  return result as unknown as IPostRevenue;
}

export async function getRevenueByPostId(postId: string): Promise<IPostRevenue[]> {
  await connectToDatabase();
  const revenue = await PostRevenue.find({ postId }).sort({ date: -1 }).lean();
  return revenue as unknown as IPostRevenue[];
}

export async function getTotalRevenueByDateRange(
  startDate: string,
  endDate: string
): Promise<number> {
  await connectToDatabase();
  const result = await PostRevenue.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
  ]);
  return result.length > 0 ? result[0].totalRevenue : 0;
}

export async function getRevenueByPostIdAndDateRange(
  postId: string,
  startDate: string,
  endDate: string
): Promise<IPostRevenue[]> {
  await connectToDatabase();
  const revenue = await PostRevenue.find({
    postId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 }).lean();
  return revenue as unknown as IPostRevenue[];
}

export async function getTotalRevenueByPostId(postId: string): Promise<number> {
  await connectToDatabase();
  const result = await PostRevenue.aggregate([
    { $match: { postId } },
    { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
  ]);
  return result.length > 0 ? result[0].totalRevenue : 0;
}
