import { NextRequest, NextResponse } from 'next/server';
import { generateStrategyReport, getHistoricalReports, getReportByWeek } from '@/lib/services/strategy-report';

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
    const history = searchParams.get('history');
    const compare = searchParams.get('compare');
    const weekStart = searchParams.get('weekStart');
    
    // Get historical reports
    if (history === 'true') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const reports = await getHistoricalReports(limit);
      return NextResponse.json({ success: true, reports });
    }
    
    // Get specific week's report
    if (weekStart) {
      const weekDate = new Date(weekStart);
      const report = await getReportByWeek(weekDate);
      
      if (!report) {
        return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true, report });
    }

    // Generate a fresh report (without saving to history by default on GET)
    const result = await generateStrategyReport(compare === 'true');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/intelligence/report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategy report' },
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
    const saveToHistory = body.saveToHistory !== false; // Default to true

    const result = await generateStrategyReport(saveToHistory);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/intelligence/report:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategy report' },
      { status: 500 }
    );
  }
}
