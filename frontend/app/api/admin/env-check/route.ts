import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const admin = process.env.ADMIN_PASSWORD;
    return NextResponse.json({
      success: true,
      adminPresent: Boolean(admin),
      adminLength: admin ? admin.length : 0,
      note: 'This endpoint confirms ADMIN_PASSWORD is set in the running server process. It does NOT reveal the secret.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error reading env' }, { status: 500 });
  }
}