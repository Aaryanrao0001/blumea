import { NextRequest, NextResponse } from 'next/server';
import { 
  calculateOpportunities, 
  getTopOpportunities, 
  markOpportunityActioned,
  dismissOpportunity
} from '@/lib/services/opportunity-calculator';

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
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : 20;
    const minScore = searchParams.get('minScore') 
      ? parseInt(searchParams.get('minScore')!) 
      : 50;

    const opportunities = await getTopOpportunities(limit, minScore);

    return NextResponse.json({ success: true, opportunities });
  } catch (error) {
    console.error('Error in GET /api/intelligence/opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
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
    const action = body.action;

    if (action === 'calculate') {
      const keywords = body.keywords || undefined;
      const result = await calculateOpportunities(keywords);
      return NextResponse.json(result);
    }

    if (action === 'mark_actioned') {
      const opportunityId = body.opportunityId;
      if (!opportunityId) {
        return NextResponse.json({ error: 'opportunityId required' }, { status: 400 });
      }
      const success = await markOpportunityActioned(opportunityId);
      return NextResponse.json({ success });
    }

    if (action === 'dismiss') {
      const opportunityId = body.opportunityId;
      if (!opportunityId) {
        return NextResponse.json({ error: 'opportunityId required' }, { status: 400 });
      }
      const success = await dismissOpportunity(opportunityId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/intelligence/opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to process opportunity action' },
      { status: 500 }
    );
  }
}
