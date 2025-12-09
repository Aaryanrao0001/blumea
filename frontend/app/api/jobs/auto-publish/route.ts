import { NextRequest, NextResponse } from 'next/server';
import { getScheduledPosts, updatePostStatus } from '@/lib/db/repositories/posts';

// This should be called by a cron service (Vercel Cron, etc.)
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get posts scheduled for now or earlier
    const scheduledPosts = await getScheduledPosts();
    
    // Limit to 10 posts per run
    const postsToPublish = scheduledPosts.slice(0, 10);
    
    const results = {
      published: 0,
      errors: [] as string[],
    };

    for (const post of postsToPublish) {
      try {
        await updatePostStatus(post._id, 'published');
        results.published++;
      } catch (error) {
        results.errors.push(`Failed to publish ${post._id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Published ${results.published} posts`,
      ...results,
    });
  } catch (error) {
    console.error('Auto-publish error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for testing (no auth required in development)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const scheduledPosts = await getScheduledPosts();
    
    return NextResponse.json({
      scheduledPosts: scheduledPosts.map(p => ({
        id: p._id,
        title: p.title,
        scheduledFor: p.scheduledFor,
      })),
      count: scheduledPosts.length,
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
