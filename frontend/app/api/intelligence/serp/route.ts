import { NextRequest, NextResponse } from 'next/server';
import { scrapeSerpData, getSerpInsights, getPAAQuestions } from '@/lib/services/serp-scraper';

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
    const action = searchParams.get('action') || 'list';
    const keyword = searchParams.get('keyword') || undefined;

    if (action === 'paa' && keyword) {
      const questions = await getPAAQuestions(keyword);
      return NextResponse.json({ success: true, questions });
    }

    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : 100;

    const insights = await getSerpInsights(keyword, limit);

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error in GET /api/intelligence/serp:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SERP insights' },
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
    const keyword = body.keyword;

    if (!keyword) {
      return NextResponse.json(
        { error: 'keyword is required' },
        { status: 400 }
      );
    }

    const result = await scrapeSerpData(keyword);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/intelligence/serp:', error);
    return NextResponse.json(
      { error: 'Failed to scrape SERP' },
      { status: 500 }
    );
  }
}
