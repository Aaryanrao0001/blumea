import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeekPlan, getAllContentPlans, updatePlanItem } from '@/lib/db/repositories/contentPlan';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_PASSWORD}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current') === 'true';

    if (current) {
      const plan = await getCurrentWeekPlan();
      return NextResponse.json({
        success: true,
        plan,
      });
    }

    const plans = await getAllContentPlans(10);
    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Error fetching content plan:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, itemId, updates } = body;

    if (!planId || !itemId || !updates) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedPlan = await updatePlanItem(planId, itemId, updates);

    return NextResponse.json({
      success: true,
      message: 'Plan item updated',
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Error updating plan item:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
