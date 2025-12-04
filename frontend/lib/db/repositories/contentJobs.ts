import { connectToDatabase } from '../mongoose';
import ContentJob from '../models/ContentJob';
import { IContentJob } from '@/lib/types';

export async function getAllContentJobs(): Promise<IContentJob[]> {
  await connectToDatabase();
  const jobs = await ContentJob.find().lean();
  return jobs as unknown as IContentJob[];
}

export async function getContentJobById(id: string): Promise<IContentJob | null> {
  await connectToDatabase();
  const job = await ContentJob.findById(id).lean();
  return job as unknown as IContentJob | null;
}

export async function getContentJobsByTopicId(topicId: string): Promise<IContentJob[]> {
  await connectToDatabase();
  const jobs = await ContentJob.find({ topicId }).lean();
  return jobs as unknown as IContentJob[];
}

export async function createContentJob(
  data: Omit<IContentJob, '_id' | 'createdAt' | 'updatedAt'>
): Promise<IContentJob> {
  await connectToDatabase();
  const job = await ContentJob.create(data);
  return job.toObject() as unknown as IContentJob;
}

export async function updateContentJob(
  id: string,
  data: Partial<Omit<IContentJob, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<IContentJob | null> {
  await connectToDatabase();
  const job = await ContentJob.findByIdAndUpdate(id, data, { new: true }).lean();
  return job as unknown as IContentJob | null;
}

export async function deleteContentJob(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await ContentJob.findByIdAndDelete(id);
  return !!result;
}

export async function getContentJobsByStatus(status: IContentJob['status']): Promise<IContentJob[]> {
  await connectToDatabase();
  const jobs = await ContentJob.find({ status }).lean();
  return jobs as unknown as IContentJob[];
}

export async function getPendingContentJobs(limit: number = 10): Promise<IContentJob[]> {
  await connectToDatabase();
  const jobs = await ContentJob.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() },
  })
    .sort({ scheduledFor: 1 })
    .limit(limit)
    .lean();
  return jobs as unknown as IContentJob[];
}

export async function markContentJobRunning(id: string): Promise<IContentJob | null> {
  await connectToDatabase();
  const job = await ContentJob.findByIdAndUpdate(
    id,
    { status: 'running', startedAt: new Date() },
    { new: true }
  ).lean();
  return job as unknown as IContentJob | null;
}

export async function markContentJobCompleted(id: string): Promise<IContentJob | null> {
  await connectToDatabase();
  const job = await ContentJob.findByIdAndUpdate(
    id,
    { status: 'completed', completedAt: new Date() },
    { new: true }
  ).lean();
  return job as unknown as IContentJob | null;
}

export async function markContentJobFailed(id: string, errorMessage: string): Promise<IContentJob | null> {
  await connectToDatabase();
  const job = await ContentJob.findByIdAndUpdate(
    id,
    { status: 'failed', errorMessage, completedAt: new Date() },
    { new: true }
  ).lean();
  return job as unknown as IContentJob | null;
}
