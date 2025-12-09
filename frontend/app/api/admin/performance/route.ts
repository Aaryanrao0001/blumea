import { NextRequest, NextResponse } from 'next/server';
import { getTopPerformers, getBottomPerformers } from '@/lib/db/repositories/postPerformance';
import { getPostById } from '@/lib/db/repositories/posts';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_PASSWORD}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get top and bottom performers
    const [topPerformers, bottomPerformers] = await Promise.all([
      getTopPerformers(limit),
      getBottomPerformers(limit),
    ]);

    // Get post details for top performers
    const topPostDetails = await Promise.all(
      topPerformers.map(async (perf) => {
        const post = await getPostById(perf.postId);
        return {
          performance: perf,
          post: post ? {
            _id: post._id,
            title: post.title,
            slug: post.slug,
            categorySlug: post.categorySlug,
            postType: post.postType,
            publishedAt: post.publishedAt,
          } : null,
        };
      })
    );

    // Calculate category performance
    const categoryPerformance = new Map<string, { total: number; count: number; posts: unknown[] }>();

    for (const { performance, post } of topPostDetails) {
      if (post && post.categorySlug) {
        const current = categoryPerformance.get(post.categorySlug) || { 
          total: 0, 
          count: 0,
          posts: []
        };
        categoryPerformance.set(post.categorySlug, {
          total: current.total + performance.successScore,
          count: current.count + 1,
          posts: [...current.posts, { postId: post._id, title: post.title, score: performance.successScore }],
        });
      }
    }

    const categoryStats = Array.from(categoryPerformance.entries()).map(([category, data]) => ({
      category,
      avgScore: data.total / data.count,
      postCount: data.count,
      topPosts: data.posts.slice(0, 3),
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Calculate overall stats
    const totalSuccessScore = topPerformers.reduce((sum, p) => sum + p.successScore, 0);
    const totalEngagement = topPerformers.reduce((sum, p) => sum + p.engagementScore, 0);
    const totalSEO = topPerformers.reduce((sum, p) => sum + p.seoScore, 0);
    const totalMonetization = topPerformers.reduce((sum, p) => sum + p.monetizationScore, 0);

    return NextResponse.json({
      success: true,
      data: {
        topPerformers: topPostDetails,
        bottomPerformers: bottomPerformers.map(p => ({
          performance: p,
          // Don't fetch full post details for bottom performers to save time
        })),
        categoryPerformance: categoryStats,
        overallStats: {
          avgSuccessScore: topPerformers.length > 0 ? totalSuccessScore / topPerformers.length : 0,
          avgEngagement: topPerformers.length > 0 ? totalEngagement / topPerformers.length : 0,
          avgSEO: topPerformers.length > 0 ? totalSEO / topPerformers.length : 0,
          avgMonetization: topPerformers.length > 0 ? totalMonetization / topPerformers.length : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
