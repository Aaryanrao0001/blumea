import { NextRequest, NextResponse } from 'next/server';
// import { getAllPostSlugs } from '@/lib/db/repositories/posts';
import { getMetricsByPostId } from '@/lib/db/repositories/postMetrics';
import { getRevenueByPostId } from '@/lib/db/repositories/postRevenue';
import { upsertPerformance } from '@/lib/db/repositories/postPerformance';
import { getCurrentConfig, ensureDefaultConfig } from '@/lib/db/repositories/strategyConfig';
import {
  calculateEngagementScore,
  calculateSeoScore,
  calculateMonetizationScore,
  calculateSuccessScore,
  aggregateMetrics,
  aggregateRevenue,
} from '@/lib/analytics/performanceCalculator';
import Post from '@/lib/db/models/Post';
import { connectToDatabase } from '@/lib/db/mongoose';

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

    const body = await request.json().catch(() => ({}));
    const daysToAggregate = body.daysToAggregate || 30; // Default to 30 days

    // Get strategy config
    const config = await getCurrentConfig() || await ensureDefaultConfig();

    // Get all posts
    await connectToDatabase();
    const posts = await Post.find().select('_id').lean();
    
    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts to calculate performance for',
        scoresCalculated: 0,
      });
    }

    let scoresCalculated = 0;
    const results = [];

    for (const post of posts) {
      try {
        const postId = post._id.toString();

        // Get metrics for the last N days
        const metricsHistory = await getMetricsByPostId(postId);
        const recentMetrics = metricsHistory.slice(0, daysToAggregate);

        // Get revenue for the last N days
        const revenueHistory = await getRevenueByPostId(postId);
        const recentRevenue = revenueHistory.slice(0, daysToAggregate);

        // If no data, skip
        if (recentMetrics.length === 0) {
          results.push({
            postId,
            status: 'skipped',
            reason: 'No metrics data available',
          });
          continue;
        }

        // Aggregate metrics
        const aggregatedMetrics = aggregateMetrics(recentMetrics);
        const aggregatedRevenue = recentRevenue.length > 0 
          ? aggregateRevenue(recentRevenue)
          : null;

        if (!aggregatedMetrics) {
          results.push({
            postId,
            status: 'skipped',
            reason: 'Failed to aggregate metrics',
          });
          continue;
        }

        // Calculate scores
        const engagementScore = calculateEngagementScore(aggregatedMetrics);
        const seoScore = calculateSeoScore(aggregatedMetrics);
        const monetizationScore = aggregatedRevenue
          ? calculateMonetizationScore(aggregatedRevenue)
          : 0;

        const successScore = calculateSuccessScore(
          engagementScore,
          seoScore,
          monetizationScore,
          config
        );

        // Upsert performance
        await upsertPerformance(postId, {
          successScore,
          engagementScore,
          seoScore,
          monetizationScore,
          lastCalculatedAt: new Date(),
        });

        scoresCalculated++;
        results.push({
          postId,
          status: 'success',
          scores: { successScore, engagementScore, seoScore, monetizationScore },
        });
      } catch (error) {
        console.error(`Error calculating performance for post ${post._id}:`, error);
        results.push({
          postId: post._id.toString(),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Calculated performance for ${scoresCalculated} posts`,
      scoresCalculated,
      results,
    });
  } catch (error) {
    console.error('Error calculating post performance:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
