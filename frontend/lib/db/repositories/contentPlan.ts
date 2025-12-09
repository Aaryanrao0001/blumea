import { connectToDatabase } from '../mongoose';
import ContentPlanModel from '../models/ContentPlan';
import { ContentPlan, ContentPlanItem } from '@/lib/types';
import { Types } from 'mongoose';

export async function createContentPlan(data: Omit<ContentPlan, '_id'>): Promise<ContentPlan> {
  await connectToDatabase();
  const plan = await ContentPlanModel.create(data);
  return plan.toObject() as ContentPlan;
}

export async function getContentPlanByWeek(weekStart: Date): Promise<ContentPlan | null> {
  await connectToDatabase();
  
  const plan = await ContentPlanModel.findOne({ weekStart }).lean();
  return plan as ContentPlan | null;
}

export async function getCurrentWeekPlan(): Promise<ContentPlan | null> {
  await connectToDatabase();
  
  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust when day is Sunday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  
  return getContentPlanByWeek(weekStart);
}

export async function updatePlanItem(
  planId: string | Types.ObjectId,
  itemId: string | Types.ObjectId,
  data: Partial<ContentPlanItem>
): Promise<ContentPlan | null> {
  await connectToDatabase();
  
  const plan = await ContentPlanModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(planId.toString()),
      'items._id': new Types.ObjectId(itemId.toString()),
    },
    {
      $set: Object.keys(data).reduce((acc, key) => {
        acc[`items.$.${key}`] = data[key as keyof ContentPlanItem];
        return acc;
      }, {} as Record<string, unknown>),
    },
    { new: true }
  ).lean();
  
  return plan as ContentPlan | null;
}

export async function getPlannedItemsForDate(date: Date): Promise<ContentPlanItem[]> {
  await connectToDatabase();
  
  // Find plans that might contain this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const plans = await ContentPlanModel.find({
    weekStart: { $lte: endOfDay },
    weekEnd: { $gte: startOfDay },
  }).lean();
  
  const items: ContentPlanItem[] = [];
  for (const plan of plans) {
    const planItems = (plan as ContentPlan).items.filter(item => {
      const itemDate = new Date(item.scheduledDateTime);
      return itemDate >= startOfDay && itemDate <= endOfDay;
    });
    items.push(...planItems);
  }
  
  return items;
}

export async function markItemCompleted(
  planId: string | Types.ObjectId,
  itemId: string | Types.ObjectId,
  draftId?: Types.ObjectId,
  postId?: Types.ObjectId
): Promise<ContentPlan | null> {
  await connectToDatabase();
  
  const updateData: Partial<ContentPlanItem> = {
    status: 'completed',
    updatedAt: new Date(),
  };
  
  if (draftId) {
    updateData.generatedDraftId = draftId;
  }
  
  if (postId) {
    updateData.publishedPostId = postId;
  }
  
  const plan = await updatePlanItem(planId, itemId, updateData);
  
  // Update total completed count
  if (plan) {
    const completedCount = plan.items.filter(item => item.status === 'completed').length;
    await ContentPlanModel.findByIdAndUpdate(
      new Types.ObjectId(planId.toString()),
      { totalCompleted: completedCount }
    );
  }
  
  return plan;
}

export async function getAllContentPlans(limit = 10): Promise<ContentPlan[]> {
  await connectToDatabase();
  
  const plans = await ContentPlanModel.find()
    .sort({ weekStart: -1 })
    .limit(limit)
    .lean();
  
  return plans as ContentPlan[];
}
