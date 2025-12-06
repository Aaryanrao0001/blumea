import { NextRequest, NextResponse } from 'next/server';
import { getPerformancesByScoreRange } from '@/lib/db/repositories/postPerformance';
import { getMetricsByPostId } from '@/lib/db/repositories/postMetrics';
import { getCurrentConfig, ensureDefaultConfig } from '@/lib/db/repositories/strategyConfig';
import { createGeneratedDraft } from '@/lib/db/repositories/generatedDrafts';
import { connectToDatabase } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Anthropic from '@anthropic-ai/sdk';
import { createRefreshPrompt } from '@/lib/ai/prompts/refreshPrompt';
import { slugify } from '@/lib/utils';

const CRON_SECRET = process.env.CRON_SECRET;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    const limit = body.limit || 5; // Default to refreshing 5 posts

    // Get strategy config
    const config = await getCurrentConfig() || await ensureDefaultConfig();

    // Identify posts needing refresh
    // 1. Posts with declining performance (below threshold)
    const lowPerformers = await getPerformancesByScoreRange(
      0,
      config.minSuccessScoreForRefresh
    );

    if (lowPerformers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts need refreshing',
        draftsCreated: 0,
      });
    }

    // Get posts with their data
    await connectToDatabase();
    const postIds = lowPerformers.slice(0, limit).map(p => p.postId);
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('category')
      .populate('author')
      .populate('tags')
      .lean();

    const results = [];

    for (const post of posts) {
      try {
        const postId = post._id.toString();
        const performance = lowPerformers.find(p => p.postId.toString() === postId);

        // Get recent metrics to identify specific issues
        const metricsHistory = await getMetricsByPostId(postId);
        const recentMetrics = metricsHistory.slice(0, 7); // Last 7 days

        // Determine refresh reason
        let reason;
        if (performance && performance.engagementScore < 40) {
          reason = {
            type: 'low_performance' as const,
            details: 'Low engagement score indicates content is not resonating with readers.',
          };
        } else if (recentMetrics.length > 0 && recentMetrics[0].searchImpressions && recentMetrics[0].searchCtr && recentMetrics[0].searchCtr < 0.02) {
          reason = {
            type: 'low_ctr' as const,
            details: 'Search impressions are good but CTR is low. Title and meta description need improvement.',
          };
        } else {
          // Check if traffic is declining
          const oldMetrics = metricsHistory.slice(7, 14);
          const recentAvgViews = recentMetrics.reduce((sum, m) => sum + m.pageViews, 0) / recentMetrics.length;
          const oldAvgViews = oldMetrics.reduce((sum, m) => sum + m.pageViews, 0) / (oldMetrics.length || 1);
          
          if (recentAvgViews < oldAvgViews * 0.7) {
            reason = {
              type: 'declining_traffic' as const,
              details: `Traffic has declined by ${Math.round((1 - recentAvgViews / oldAvgViews) * 100)}% in the last week.`,
            };
          } else {
            reason = {
              type: 'outdated' as const,
              details: 'Content may be outdated or no longer optimized for current search intent.',
            };
          }
        }

        // Generate refresh prompt
        const prompt = createRefreshPrompt(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          post as any,
          performance || null,
          reason,
          config
        );

        // Call Claude to refresh content
        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }

        const refreshedBody = content.text;

        // Create a draft with refreshed content
        const draft = await createGeneratedDraft({
          topicId: post._id, // Using post ID as topic placeholder
          productIds: [],
          postType: post.type,
          title: `${post.title} (Refreshed)`,
          slug: `${slugify(post.title)}-refreshed-${Date.now()}`,
          excerpt: post.excerpt,
          coverImageUrl: post.coverImage.url,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          categorySlug: (post.category as any)?.slug || 'skincare',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tagSlugs: ((post.tags || []) as any[]).map(t => t.slug),
          seoTitle: post.title,
          seoDescription: post.excerpt,
          schemaJson: {},
          faq: [],
          outline: [],
          bodyRaw: refreshedBody,
          wordCount: refreshedBody.split(/\s+/).length,
          status: config.autoPublishEnabled ? 'approved' : 'draft',
          createdBy: 'system',
        });

        results.push({
          postId,
          postTitle: post.title,
          draftId: draft._id.toString(),
          refreshReason: reason.type,
          status: 'success',
        });
      } catch (error) {
        console.error(`Error refreshing post ${post._id}:`, error);
        results.push({
          postId: post._id.toString(),
          postTitle: post.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Refreshed ${results.filter(r => r.status === 'success').length} posts`,
      draftsCreated: results.filter(r => r.status === 'success').length,
      results,
    });
  } catch (error) {
    console.error('Error refreshing content:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
