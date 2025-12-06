import { NextRequest, NextResponse } from 'next/server';
import { getTopPerformers } from '@/lib/db/repositories/postPerformance';
import { updateStrategyConfig } from '@/lib/db/repositories/strategyConfig';
import { getPostById } from '@/lib/db/repositories/posts';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get top and bottom performers
    const topPosts = await getTopPerformers(10);
    // const bottomPosts = await getBottomPerformers(10); // Reserved for future use

    // Analyze category performance
    const categoryPerformance = new Map<string, { total: number; count: number }>();

    for (const perf of topPosts) {
      const post = await getPostById(perf.postId);
      if (post && post.categorySlug) {
        const current = categoryPerformance.get(post.categorySlug) || { total: 0, count: 0 };
        categoryPerformance.set(post.categorySlug, {
          total: current.total + perf.successScore,
          count: current.count + 1,
        });
      }
    }

    // Calculate average scores and weights
    const topicPreferences = Array.from(categoryPerformance.entries()).map(([category, data]) => ({
      category,
      weight: data.total / data.count / 100, // Normalize to 0-1 range
    }));

    // Analyze content patterns from top performers
    let totalIntroWords = 0;
    let totalFaqCount = 0;
    let hasComparisonCount = 0;
    let topPostsCount = 0;

    // TODO: Implement actual content analysis
    // This is a simplified mock version
    for (const perf of topPosts) {
      const post = await getPostById(perf.postId);
      if (post) {
        topPostsCount++;
        // TODO: Analyze actual post content for intro word count
        totalIntroWords += 150; // Mock value - replace with actual analysis
        // TODO: Analyze for FAQ sections
        totalFaqCount += 5; // Mock value - replace with actual analysis
        // TODO: Check for comparison tables in content
        if (Math.random() > 0.5) hasComparisonCount++; // Mock - replace with actual check
      }
    }

    const avgIntroWords = topPostsCount > 0 ? Math.round(totalIntroWords / topPostsCount) : 150;
    const avgFaqCount = topPostsCount > 0 ? Math.round(totalFaqCount / topPostsCount) : 5;
    const comparisonTableProbability = topPostsCount > 0 ? hasComparisonCount / topPostsCount : 0.7;

    // Update strategy config
    await updateStrategyConfig({
      topicPreferences,
      contentRules: {
        introMaxWords: avgIntroWords,
        faqCount: avgFaqCount,
        useComparisonTable: comparisonTableProbability > 0.5,
        comparisonTableProbability,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Strategy config updated based on performance data',
      insights: {
        topPerformingCategories: topicPreferences.slice(0, 5),
        avgIntroWords,
        avgFaqCount,
        comparisonTableProbability,
      },
    });
  } catch (error) {
    console.error('Error in update-strategy job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
