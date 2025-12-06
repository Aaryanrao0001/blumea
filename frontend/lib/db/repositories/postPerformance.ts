import { connectToDatabase } from '../mongoose';
import PostPerformance from '../models/PostPerformance';
import { IPostPerformance } from '@/lib/types';

export async function upsertPerformance(
  postId: string,
  performance: Omit<IPostPerformance, '_id' | 'postId' | 'createdAt' | 'updatedAt'>
): Promise<IPostPerformance> {
  await connectToDatabase();
  const result = await PostPerformance.findOneAndUpdate(
    { postId },
    { $set: performance },
    { upsert: true, new: true }
  ).lean();
  return result as unknown as IPostPerformance;
}

export async function getPerformanceByPostId(postId: string): Promise<IPostPerformance | null> {
  await connectToDatabase();
  const performance = await PostPerformance.findOne({ postId }).lean();
  return performance as unknown as IPostPerformance | null;
}

export async function getTopPerformers(limit: number = 10): Promise<IPostPerformance[]> {
  await connectToDatabase();
  const performers = await PostPerformance.find()
    .sort({ successScore: -1 })
    .limit(limit)
    .lean();
  return performers as unknown as IPostPerformance[];
}

export async function getBottomPerformers(limit: number = 10): Promise<IPostPerformance[]> {
  await connectToDatabase();
  const performers = await PostPerformance.find()
    .sort({ successScore: 1 })
    .limit(limit)
    .lean();
  return performers as unknown as IPostPerformance[];
}

export async function getAllPerformances(): Promise<IPostPerformance[]> {
  await connectToDatabase();
  const performances = await PostPerformance.find().sort({ successScore: -1 }).lean();
  return performances as unknown as IPostPerformance[];
}

export async function getPerformancesByScoreRange(
  minScore: number,
  maxScore: number
): Promise<IPostPerformance[]> {
  await connectToDatabase();
  const performances = await PostPerformance.find({
    successScore: { $gte: minScore, $lte: maxScore }
  }).sort({ successScore: -1 }).lean();
  return performances as unknown as IPostPerformance[];
}
