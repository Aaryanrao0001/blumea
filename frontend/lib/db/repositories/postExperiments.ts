import { connectToDatabase } from '../mongoose';
import PostExperiment from '../models/PostExperiment';
import { IPostExperiment } from '@/lib/types';

export async function createExperiment(
  data: Omit<IPostExperiment, '_id' | 'createdAt' | 'updatedAt'>
): Promise<IPostExperiment> {
  await connectToDatabase();
  const experiment = await PostExperiment.create(data);
  return experiment.toObject() as unknown as IPostExperiment;
}

export async function updateExperimentMetrics(
  experimentId: string,
  variantKey: string,
  metrics: { impressions?: number; clicks?: number; conversions?: number }
): Promise<IPostExperiment | null> {
  await connectToDatabase();
  const experiment = await PostExperiment.findById(experimentId);
  if (!experiment) return null;

  const currentMetrics = experiment.metrics[variantKey] || {
    impressions: 0,
    clicks: 0,
    conversions: 0
  };

  experiment.metrics[variantKey] = {
    impressions: metrics.impressions ?? currentMetrics.impressions,
    clicks: metrics.clicks ?? currentMetrics.clicks,
    conversions: metrics.conversions ?? currentMetrics.conversions,
  };

  await experiment.save();
  return experiment.toObject() as unknown as IPostExperiment;
}

export async function completeExperiment(
  experimentId: string,
  winningVariantKey: string
): Promise<IPostExperiment | null> {
  await connectToDatabase();
  const experiment = await PostExperiment.findByIdAndUpdate(
    experimentId,
    {
      status: 'completed',
      endDate: new Date(),
      winningVariantKey
    },
    { new: true }
  ).lean();
  return experiment as unknown as IPostExperiment | null;
}

export async function getActiveExperiments(): Promise<IPostExperiment[]> {
  await connectToDatabase();
  const experiments = await PostExperiment.find({ status: 'running' })
    .sort({ startDate: -1 })
    .lean();
  return experiments as unknown as IPostExperiment[];
}

export async function getExperimentById(experimentId: string): Promise<IPostExperiment | null> {
  await connectToDatabase();
  const experiment = await PostExperiment.findById(experimentId).lean();
  return experiment as unknown as IPostExperiment | null;
}

export async function getExperimentsByPostId(postId: string): Promise<IPostExperiment[]> {
  await connectToDatabase();
  const experiments = await PostExperiment.find({ postId })
    .sort({ startDate: -1 })
    .lean();
  return experiments as unknown as IPostExperiment[];
}
