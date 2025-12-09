import { NextRequest, NextResponse } from 'next/server';
import { getCurrentConfig } from '@/lib/db/repositories/strategyConfig';
import { getTopTopicsForJob } from '@/lib/db/repositories/topics';
import { createContentPlan, getContentPlanByWeek } from '@/lib/db/repositories/contentPlan';
import { ContentPlanItem } from '@/lib/types';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get strategy config
    const config = await getCurrentConfig();

    // Calculate week boundaries (Monday to Sunday)
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const dayOfWeek = nextWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(nextWeek);
    weekStart.setDate(nextWeek.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if plan already exists
    const existingPlan = await getContentPlanByWeek(weekStart);
    if (existingPlan) {
      return NextResponse.json({
        success: true,
        message: 'Content plan already exists for this week',
        plan: existingPlan,
      });
    }

    // Determine how many posts to plan
    const postsPerDay = config.contentVolume?.minPostsPerDay || config.maxPostsPerDay || 2;
    const totalPosts = Math.min(
      postsPerDay * 7,
      config.contentVolume?.maxPostsPerWeek || 14
    );

    // Get available topics
    const topics = await getTopTopicsForJob(totalPosts * 2);

    // Generate plan items
    const items: Omit<ContentPlanItem, '_id'>[] = [];
    const categoryCounts: Record<string, number> = {};
    const typeCounts = { blog: 0, review: 0, comparison: 0 };

    for (let i = 0; i < totalPosts && i < topics.length; i++) {
      const topic = topics[i];
      
      // Determine post type based on config
      let postType: "blog" | "review" | "comparison" = "blog";
      const perType = config.contentVolume?.perType;
      
      if (perType) {
        if (typeCounts.blog < (perType.blog?.maxPerWeek || 10)) {
          postType = "blog";
        } else if (typeCounts.review < (perType.review?.maxPerWeek || 7)) {
          postType = "review";
        } else if (typeCounts.comparison < (perType.comparison?.maxPerWeek || 4)) {
          postType = "comparison";
        }
      }
      typeCounts[postType]++;

      const categorySlug = 'skincare';
      categoryCounts[categorySlug] = (categoryCounts[categorySlug] || 0) + 1;

      // Schedule time
      const dayIndex = Math.floor(i / postsPerDay);
      const scheduledDate = new Date(weekStart);
      scheduledDate.setDate(weekStart.getDate() + dayIndex);
      
      const defaultHour = 10 + (i % postsPerDay) * 4;
      scheduledDate.setHours(defaultHour, 0, 0, 0);

      items.push({
        scheduledDateTime: scheduledDate,
        topicId: topic._id,
        postType,
        categorySlug,
        status: 'planned',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ContentPlanItem);
    }

    // Create the plan
    const plan = await createContentPlan({
      weekStart,
      weekEnd,
      items: items as ContentPlanItem[],
      totalPlanned: items.length,
      totalCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Content plan created for week of ${weekStart.toISOString().split('T')[0]}`,
      plan: {
        _id: plan._id,
        weekStart: plan.weekStart,
        weekEnd: plan.weekEnd,
        totalPlanned: plan.totalPlanned,
        itemsCount: plan.items.length,
        breakdown: {
          byType: typeCounts,
          byCategory: categoryCounts,
        },
      },
    });
  } catch (error) {
    console.error('Error creating content plan:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
