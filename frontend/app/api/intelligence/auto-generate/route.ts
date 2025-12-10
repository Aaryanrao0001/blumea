import { NextRequest, NextResponse } from 'next/server';
import { triggerAutoContentGeneration } from '@/lib/services/auto-content';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '') || 
               req.headers.get('x-admin-secret');
  return auth === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const count = body.count || 3;
    const minScore = body.minScore || 70;

    const result = await triggerAutoContentGeneration(count, minScore);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/intelligence/auto-generate:', error);
    return NextResponse.json(
      { error: 'Failed to trigger auto content generation' },
      { status: 500 }
    );
  }
}
