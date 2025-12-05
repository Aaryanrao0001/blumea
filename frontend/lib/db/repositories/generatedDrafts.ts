import { connectToDatabase } from '../mongoose';
import GeneratedDraft from '../models/GeneratedDraft';
import { IGeneratedDraft } from '@/lib/types';

export async function getAllGeneratedDrafts(): Promise<IGeneratedDraft[]> {
  await connectToDatabase();
  const drafts = await GeneratedDraft.find().sort({ createdAt: -1 }).lean();
  return drafts as unknown as IGeneratedDraft[];
}

export async function getGeneratedDraftBySlug(slug: string): Promise<IGeneratedDraft | null> {
  await connectToDatabase();
  const draft = await GeneratedDraft.findOne({ slug }).lean();
  return draft as unknown as IGeneratedDraft | null;
}

export async function getGeneratedDraftById(id: string): Promise<IGeneratedDraft | null> {
  await connectToDatabase();
  const draft = await GeneratedDraft.findById(id).lean();
  return draft as unknown as IGeneratedDraft | null;
}

export async function createGeneratedDraft(
  data: Omit<IGeneratedDraft, '_id' | 'createdAt' | 'updatedAt'>
): Promise<IGeneratedDraft> {
  await connectToDatabase();
  const draft = await GeneratedDraft.create(data);
  return draft.toObject() as unknown as IGeneratedDraft;
}

export async function updateGeneratedDraft(
  id: string,
  data: Partial<Omit<IGeneratedDraft, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<IGeneratedDraft | null> {
  await connectToDatabase();
  const draft = await GeneratedDraft.findByIdAndUpdate(id, data, { new: true }).lean();
  return draft as unknown as IGeneratedDraft | null;
}

export async function deleteGeneratedDraft(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await GeneratedDraft.findByIdAndDelete(id);
  return !!result;
}

export async function getGeneratedDraftsByStatus(status: IGeneratedDraft['status']): Promise<IGeneratedDraft[]> {
  await connectToDatabase();
  const drafts = await GeneratedDraft.find({ status }).sort({ createdAt: -1 }).lean();
  return drafts as unknown as IGeneratedDraft[];
}

export async function getGeneratedDraftsByTopicId(topicId: string): Promise<IGeneratedDraft[]> {
  await connectToDatabase();
  const drafts = await GeneratedDraft.find({ topicId }).lean();
  return drafts as unknown as IGeneratedDraft[];
}

export async function approveDraft(id: string): Promise<IGeneratedDraft | null> {
  await connectToDatabase();
  const draft = await GeneratedDraft.findByIdAndUpdate(
    id,
    { status: 'approved' },
    { new: true }
  ).lean();
  return draft as unknown as IGeneratedDraft | null;
}

export async function rejectDraft(id: string): Promise<IGeneratedDraft | null> {
  await connectToDatabase();
  const draft = await GeneratedDraft.findByIdAndUpdate(
    id,
    { status: 'rejected' },
    { new: true }
  ).lean();
  return draft as unknown as IGeneratedDraft | null;
}

export async function markDraftPublished(id: string, publishedPostId: string): Promise<IGeneratedDraft | null> {
  await connectToDatabase();
  const draft = await GeneratedDraft.findByIdAndUpdate(
    id,
    { status: 'published', publishedPostId },
    { new: true }
  ).lean();
  return draft as unknown as IGeneratedDraft | null;
}

export async function getDraftsWithPagination(
  options: {
    status?: IGeneratedDraft['status'];
    limit?: number;
    page?: number;
  } = {}
): Promise<{
  drafts: IGeneratedDraft[];
  total: number;
}> {
  await connectToDatabase();
  const { status, limit = 10, page = 1 } = options;
  
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  
  const [drafts, total] = await Promise.all([
    GeneratedDraft.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GeneratedDraft.countDocuments(query),
  ]);

  return {
    drafts: drafts as unknown as IGeneratedDraft[],
    total,
  };
}
