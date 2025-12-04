import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSubscriber } from '@/lib/db/repositories/subscribers';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = subscribeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0]?.message || 'Invalid email' 
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    await createSubscriber(email);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    
    if (error instanceof Error && error.message === 'Email already subscribed') {
      return NextResponse.json(
        { success: false, message: 'You are already subscribed' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
