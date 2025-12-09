import { NextRequest, NextResponse } from 'next/server';
import { getAllPostsPhase3 } from '@/lib/db/repositories/posts';
import { getLatestMetrics } from '@/lib/db/repositories/postMetrics';
import { getLatestRevenue } from '@/lib/db/repositories/postRevenue';
import { upsertPerformance } from '@/lib/db/repositories/postPerformance';
import { getOrCreateStrategyConfig } from '@/lib/db/repositories/strategyConfig';

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

    const config = await getOrCreateStrategyConfig();
    const { posts } = await getAllPostsPhase3({ status: 'published' });

    const results = {
      processed: 0,
      errors: [] as string[],
    };

    for (const post of posts) {
      try {
        const metrics = await getLatestMetrics(post._id);
        const revenue = await getLatestRevenue(post._id);

        // Calculate engagement score (0-100)
        let engagementScore = 0;
        if (metrics) {
          const avgTime = metrics.avgEngagedTime || metrics.avgTimeOnPage || 0;
          const avgTimeScore = Math.min((avgTime / 300) * 100, 100); // 5 min = 100
          const bounceScore = (1 - metrics.bounceRate) * 100;
          const scrollScore = metrics.scrollDepthAvg * 100;
          const shareScore = Math.min((metrics.socialShares || 0) * 10, 100);
          
          engagementScore = (avgTimeScore * 0.3 + bounceScore * 0.3 + scrollScore * 0.2 + shareScore * 0.2);
        }

        // Calculate SEO score (0-100)
        let seoScore = 0;
        if (metrics) {
          const trafficScore = Math.min((metrics.pageViews / 1000) * 100, 100);
          const uniqueVisitorScore = Math.min((metrics.uniqueVisitors / 500) * 100, 100);
          
          seoScore = (trafficScore * 0.6 + uniqueVisitorScore * 0.4);
        }

        // Calculate monetization score (0-100)
        let monetizationScore = 0;
        if (revenue) {
          const revenueScore = Math.min((revenue.revenue / 100) * 100, 100); // $100 = 100
          const conversionScore = Math.min(revenue.conversions * 20, 100);
          const epcScore = Math.min((revenue.epc / 1) * 100, 100); // $1 EPC = 100
          
          monetizationScore = (revenueScore * 0.5 + conversionScore * 0.3 + epcScore * 0.2);
        }

        // Calculate overall success score using weights
        const successScore =
          engagementScore * config.weights.engagement +
          seoScore * config.weights.seo +
          monetizationScore * config.weights.monetization;

        await upsertPerformance({
          postId: post._id,
          successScore,
          engagementScore,
          seoScore,
          monetizationScore,
          lastCalculated: new Date(),
        });

        results.processed++;
      } catch (error) {
        results.errors.push(`Error processing post ${post._id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Post performance calculation completed',
      results,
    });
  } catch (error) {
    console.error('Error in calc-post-performance job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
