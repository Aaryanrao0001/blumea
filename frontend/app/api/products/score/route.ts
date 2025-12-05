import { NextRequest, NextResponse } from 'next/server';
import { getSkincareProductById } from '@/lib/db/repositories/skincareProducts';
import { updateProductScore } from '@/lib/db/repositories/productScores';
import { calculateProductScore } from '@/lib/scoring/calculateScore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'productId is required' },
        { status: 400 }
      );
    }

    const product = await getSkincareProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const calculatedScore = await calculateProductScore(product);
    const savedScore = await updateProductScore(productId, {
      ...calculatedScore,
      lastCalculatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      score: savedScore,
    });
  } catch (error) {
    console.error('Error calculating product score:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
