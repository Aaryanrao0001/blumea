import { NextRequest, NextResponse } from 'next/server';
import { runFullIntelligenceGathering } from '@/lib/services/intelligence-cron';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CRON_SECRET = process.env.CRON_SECRET || ADMIN_PASSWORD;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '') || 
               req.headers.get('x-cron-secret') ||
               req.headers.get('x-admin-secret');
  return auth === CRON_SECRET || auth === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting full intelligence gathering cron job...');
    
    const results = await runFullIntelligenceGathering();
    
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;
    
    return NextResponse.json({
      success: true,
      totalJobs: results.length,
      successful: successCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    console.error('Error in POST /api/cron/intelligence:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
