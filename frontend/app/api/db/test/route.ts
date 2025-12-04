import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database not connected' },
        { status: 500 }
      );
    }
    const collections = await db.listCollections().toArray();
    return NextResponse.json({
      success: true,
      message: 'MongoDB connected',
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
