import { NextRequest, NextResponse } from 'next/server';
import { getAllExperiments, createExperiment, concludeExperiment } from '@/lib/db/repositories/postExperiments';

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
    const status = searchParams.get('status') as "running" | "concluded" | "cancelled" | null;

    const experiments = await getAllExperiments(status || undefined);

    return NextResponse.json({
      success: true,
      experiments,
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, experimentId, winnerVariantId, experimentData } = body;

    if (action === 'conclude') {
      if (!experimentId || !winnerVariantId) {
        return NextResponse.json(
          { success: false, message: 'Missing experimentId or winnerVariantId' },
          { status: 400 }
        );
      }

      const experiment = await concludeExperiment(experimentId, winnerVariantId);

      return NextResponse.json({
        success: true,
        message: 'Experiment concluded',
        experiment,
      });
    } else if (action === 'create') {
      if (!experimentData) {
        return NextResponse.json(
          { success: false, message: 'Missing experiment data' },
          { status: 400 }
        );
      }

      const experiment = await createExperiment(experimentData);

      return NextResponse.json({
        success: true,
        message: 'Experiment created',
        experiment,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in experiments endpoint:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
