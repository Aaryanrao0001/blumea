import { NextRequest, NextResponse } from 'next/server';
import { generateStrategyReport } from '@/lib/services/strategy-report';

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

    // For GET, we'll generate a fresh report
    const result = await generateStrategyReport();

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

    const result = await generateStrategyReport();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/intelligence/report:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategy report' },
      { status: 500 }
    );
  }
}
