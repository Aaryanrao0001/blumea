import { NextRequest, NextResponse } from 'next/server';
import { getScheduledPosts, updatePostStatus } from '@/lib/db/repositories/posts';

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

    const scheduledPosts = await getScheduledPosts();

    const results = {
      published: 0,
      errors: [] as string[],
    };

    for (const post of scheduledPosts) {
      try {
        await updatePostStatus(post._id, 'published');
        results.published++;

        // TODO: Trigger ISR revalidation for relevant pages
        // Example:
        // await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?path=/blog`, {
        //   method: 'POST',
        //   headers: { 'x-revalidate-secret': process.env.REVALIDATE_SECRET }
        // });
        
        console.log(`Published scheduled post: ${post.title}`);
      } catch (error) {
        results.errors.push(`Error publishing post ${post._id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Publish scheduled posts job completed',
      results,
    });
  } catch (error) {
    console.error('Error in publish-scheduled job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
