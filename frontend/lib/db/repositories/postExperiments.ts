import { connectToDatabase } from '../mongoose';
import PostExperimentModel from '../models/PostExperiment';
import { PostExperiment, ExperimentVariant } from '@/lib/types';
import { Types } from 'mongoose';

export async function createExperiment(data: Omit<PostExperiment, '_id'>): Promise<PostExperiment> {
  await connectToDatabase();
  const experiment = await PostExperimentModel.create(data);
  return experiment.toObject() as PostExperiment;
}

export async function getExperimentsByPostId(postId: string | Types.ObjectId): Promise<PostExperiment[]> {
  await connectToDatabase();
  
  const experiments = await PostExperimentModel.find({
    postId: new Types.ObjectId(postId.toString()),
  })
    .sort({ startedAt: -1 })
    .lean();
  
  return experiments as PostExperiment[];
}

export async function getRunningExperiments(): Promise<PostExperiment[]> {
  await connectToDatabase();
  
  const experiments = await PostExperimentModel.find({
    status: 'running',
  }).lean();
  
  return experiments as PostExperiment[];
}

export async function updateVariantMetrics(
  experimentId: string | Types.ObjectId,
  variantId: string,
  metrics: Partial<ExperimentVariant>
): Promise<PostExperiment | null> {
  await connectToDatabase();
  
  const updateFields: Record<string, unknown> = {};
  
  if (metrics.impressions !== undefined) {
    updateFields['variants.$.impressions'] = metrics.impressions;
  }
  if (metrics.clicks !== undefined) {
    updateFields['variants.$.clicks'] = metrics.clicks;
  }
  if (metrics.conversions !== undefined) {
    updateFields['variants.$.conversions'] = metrics.conversions;
  }
  if (metrics.engagementTime !== undefined) {
    updateFields['variants.$.engagementTime'] = metrics.engagementTime;
  }
  
  const experiment = await PostExperimentModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(experimentId.toString()),
      'variants.variantId': variantId,
    },
    { $set: updateFields },
    { new: true }
  ).lean();
  
  return experiment as PostExperiment | null;
}

export async function concludeExperiment(
  experimentId: string | Types.ObjectId,
  winnerVariantId: string
): Promise<PostExperiment | null> {
  await connectToDatabase();
  
  const experiment = await PostExperimentModel.findByIdAndUpdate(
    new Types.ObjectId(experimentId.toString()),
    {
      status: 'concluded',
      winnerVariantId,
      concludedAt: new Date(),
    },
    { new: true }
  ).lean();
  
  return experiment as PostExperiment | null;
}

export async function getExperimentResults(
  experimentId: string | Types.ObjectId
): Promise<PostExperiment | null> {
  await connectToDatabase();
  
  const experiment = await PostExperimentModel.findById(
    new Types.ObjectId(experimentId.toString())
  ).lean();
  
  return experiment as PostExperiment | null;
}

export async function getAllExperiments(
  status?: "running" | "concluded" | "cancelled",
  limit = 50
): Promise<PostExperiment[]> {
  await connectToDatabase();
  
  const query = status ? { status } : {};
  
  const experiments = await PostExperimentModel.find(query)
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean();
  
  return experiments as PostExperiment[];
}
