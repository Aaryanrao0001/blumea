import { connectToDatabase } from '../mongoose';
import Topic from '../models/Topic';
import { ITopic } from '@/lib/types';

export async function getAllTopics(): Promise<ITopic[]> {
  await connectToDatabase();
  const topics = await Topic.find().lean();
  return topics as unknown as ITopic[];
}

export async function getTopicBySlug(slug: string): Promise<ITopic | null> {
  await connectToDatabase();
  const topic = await Topic.findOne({ slug }).lean();
  return topic as unknown as ITopic | null;
}

export async function getTopicById(id: string): Promise<ITopic | null> {
  await connectToDatabase();
  const topic = await Topic.findById(id).lean();
  return topic as unknown as ITopic | null;
}

export async function createTopic(
  data: Omit<ITopic, '_id' | 'createdAt' | 'updatedAt'>
): Promise<ITopic> {
  await connectToDatabase();
  const topic = await Topic.create(data);
  return topic.toObject() as unknown as ITopic;
}

export async function updateTopic(
  id: string,
  data: Partial<Omit<ITopic, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<ITopic | null> {
  await connectToDatabase();
  const topic = await Topic.findByIdAndUpdate(id, data, { new: true }).lean();
  return topic as unknown as ITopic | null;
}

export async function deleteTopic(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await Topic.findByIdAndDelete(id);
  return !!result;
}

export async function getTopicsByStatus(status: ITopic['status']): Promise<ITopic[]> {
  await connectToDatabase();
  const topics = await Topic.find({ status }).lean();
  return topics as unknown as ITopic[];
}

export async function getTopTopicsForJob(limit: number = 5): Promise<ITopic[]> {
  await connectToDatabase();
  const topics = await Topic.find({ status: 'new' })
    .sort({ trendScore: -1, monetizationScore: -1 })
    .limit(limit)
    .lean();
  return topics as unknown as ITopic[];
}

export async function markTopicUsed(id: string): Promise<ITopic | null> {
  await connectToDatabase();
  const topic = await Topic.findByIdAndUpdate(
    id,
    { status: 'used' },
    { new: true }
  ).lean();
  return topic as unknown as ITopic | null;
}

export async function markTopicSelected(id: string): Promise<ITopic | null> {
  await connectToDatabase();
  const topic = await Topic.findByIdAndUpdate(
    id,
    { status: 'selected' },
    { new: true }
  ).lean();
  return topic as unknown as ITopic | null;
}

export async function markTopicRejected(id: string): Promise<ITopic | null> {
  await connectToDatabase();
  const topic = await Topic.findByIdAndUpdate(
    id,
    { status: 'rejected' },
    { new: true }
  ).lean();
  return topic as unknown as ITopic | null;
}

export async function bulkUpsertTopics(
  topics: Omit<ITopic, '_id' | 'createdAt' | 'updatedAt'>[]
): Promise<number> {
  await connectToDatabase();
  const operations = topics.map((topic) => ({
    updateOne: {
      filter: { slug: topic.slug },
      update: { $set: topic },
      upsert: true,
    },
  }));
  const result = await Topic.bulkWrite(operations);
  return result.upsertedCount + result.modifiedCount;
}
