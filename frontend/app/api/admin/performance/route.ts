import { NextResponse } from 'next/server';
import { getAllPerformances } from '@/lib/db/repositories/postPerformance';
import { connectToDatabase } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';

export async function GET() {
  try {
    const performances = await getAllPerformances();
    
    // Enrich with post details
    await connectToDatabase();
    const postIds = performances.map(p => p.postId);
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('category')
      .lean();

    const enriched = performances.map(perf => {
      const post = posts.find(p => p._id.toString() === perf.postId.toString());
      return {
        _id: perf._id.toString(),
        postId: perf.postId.toString(),
        postTitle: post?.title || 'Unknown',
        postSlug: post?.slug || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categorySlug: (post?.category as any)?.slug || 'unknown',
        postType: post?.type || 'blog',
        successScore: perf.successScore,
        engagementScore: perf.engagementScore,
        seoScore: perf.seoScore,
        monetizationScore: perf.monetizationScore,
        lastCalculatedAt: perf.lastCalculatedAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, performances: enriched });
  } catch (error) {
    console.error('Error fetching performances:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
