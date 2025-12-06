import { connectToDatabase } from '../mongoose';
import PostPerformanceModel from '../models/PostPerformance';
import { PostPerformance } from '@/lib/types';
import { Types } from 'mongoose';

export async function createPerformance(data: Omit<PostPerformance, '_id'>): Promise<PostPerformance> {
  await connectToDatabase();
  const performance = await PostPerformanceModel.create(data);
  return performance.toObject() as PostPerformance;
}

export async function getPerformanceByPostId(postId: string | Types.ObjectId): Promise<PostPerformance | null> {
  await connectToDatabase();
  
  const performance = await PostPerformanceModel.findOne({ 
    postId: new Types.ObjectId(postId.toString()) 
  }).lean();
  
  return performance as PostPerformance | null;
}

export async function upsertPerformance(data: Omit<PostPerformance, '_id'>): Promise<PostPerformance> {
  await connectToDatabase();
  
  const performance = await PostPerformanceModel.findOneAndUpdate(
    { postId: data.postId },
    { ...data, lastCalculated: new Date() },
    { upsert: true, new: true }
  ).lean();
  
  return performance as PostPerformance;
}

export async function getTopPerformers(limit: number = 10): Promise<PostPerformance[]> {
  await connectToDatabase();
  
  const performances = await PostPerformanceModel.find()
    .sort({ successScore: -1 })
    .limit(limit)
    .lean();
  
  return performances as PostPerformance[];
}

export async function getBottomPerformers(limit: number = 10): Promise<PostPerformance[]> {
  await connectToDatabase();
  
  const performances = await PostPerformanceModel.find()
    .sort({ successScore: 1 })
    .limit(limit)
    .lean();
  
  return performances as PostPerformance[];
}

export async function getAllPerformances(): Promise<PostPerformance[]> {
  await connectToDatabase();
  
  const performances = await PostPerformanceModel.find()
    .sort({ successScore: -1 })
    .lean();
  
  return performances as PostPerformance[];
}
