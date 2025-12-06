import { NextRequest, NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;

// Map of job names to their endpoints
const JOB_ENDPOINTS: Record<string, string> = {
  'Fetch Analytics': '/api/jobs/fetch-analytics',
  'Calculate Performance': '/api/jobs/calc-post-performance',
  'Update Strategy': '/api/jobs/update-strategy',
  'Refresh Content': '/api/jobs/refresh-content',
  'Daily Content Generation': '/api/jobs/run-daily-content',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobName, jobBody } = body;

    if (!jobName || !JOB_ENDPOINTS[jobName]) {
      return NextResponse.json(
        { success: false, message: 'Invalid job name' },
        { status: 400 }
      );
    }

    const jobEndpoint = JOB_ENDPOINTS[jobName];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${jobEndpoint}`;

    // Call the job endpoint with CRON_SECRET
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET || '',
      },
      body: jobBody ? JSON.stringify(jobBody) : undefined,
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
