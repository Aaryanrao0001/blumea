import { NextRequest, NextResponse } from 'next/server';
import { getCurrentConfig, updateConfig } from '@/lib/db/repositories/strategyConfig';

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

    const config = await getCurrentConfig();
    
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Error fetching strategy config:', error);
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
    const updates = body.updates;

    if (!updates) {
      return NextResponse.json(
        { success: false, message: 'No updates provided' },
        { status: 400 }
      );
    }

    // Increment version if it exists
    if (updates.version !== undefined) {
      updates.version = updates.version + 1;
    }

    const updatedConfig = await updateConfig(updates);

    return NextResponse.json({
      success: true,
      message: 'Strategy config updated',
      config: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating strategy config:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
