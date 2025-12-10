import { NextRequest, NextResponse } from 'next/server';
import { analyzeTrendsForKeyword, getTrendsInsights, getRisingKeywords } from '@/lib/services/google-trends';

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

    if (action === 'rising') {
      const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
      const insights = await getRisingKeywords(limit);
      return NextResponse.json({ success: true, insights });
    }

    const keyword = searchParams.get('keyword') || undefined;
    const trendDirection = searchParams.get('trendDirection') as any;
    const minGrowth = searchParams.get('minGrowth') 
      ? parseFloat(searchParams.get('minGrowth')!) 
      : undefined;
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : 100;

    const insights = await getTrendsInsights({
      keyword,
      trendDirection,
      minGrowth,
      limit,
    });

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error('Error in GET /api/intelligence/trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends insights' },
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
    const timeRange = body.timeRange || '3-m';

    if (!keyword) {
      return NextResponse.json(
        { error: 'keyword is required' },
        { status: 400 }
      );
    }

    const result = await analyzeTrendsForKeyword(keyword, timeRange);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/intelligence/trends:', error);
    return NextResponse.json(
      { error: 'Failed to analyze trends' },
      { status: 500 }
    );
  }
}
