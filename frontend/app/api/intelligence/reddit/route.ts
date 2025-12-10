import { NextRequest, NextResponse } from 'next/server';
import { scrapeRedditInsights, getRedditInsights } from '@/lib/services/reddit-scraper';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '') || 
               req.headers.get('x-admin-secret');
  return auth === ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subreddit = searchParams.get('subreddit') || undefined;
    const intentType = searchParams.get('intentType') || undefined;
    const minSentiment = searchParams.get('minSentiment') 
      ? parseFloat(searchParams.get('minSentiment')!) 
      : undefined;
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : 100;

    const insights = await getRedditInsights({
      subreddit,
      intentType,
      minSentiment,
      limit,
    });

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error in GET /api/intelligence/reddit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Reddit insights' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const subreddits = body.subreddits || undefined;
    const sort = body.sort || 'hot';
    const limit = body.limit || 25;

    const result = await scrapeRedditInsights(subreddits, sort, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/intelligence/reddit:', error);
    return NextResponse.json(
      { error: 'Failed to scrape Reddit' },
      { status: 500 }
    );
  }
}
