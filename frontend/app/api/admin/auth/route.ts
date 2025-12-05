import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, message: 'Authentication successful' });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error authenticating:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}
