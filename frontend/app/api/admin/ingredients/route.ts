import { NextRequest, NextResponse } from 'next/server';
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getIngredientsByCategory,
} from '@/lib/db/repositories/ingredients';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'active' | 'emollient' | 'fragrance' | 'preservative' | 'surfactant' | 'other' | null;
    const id = searchParams.get('id');

    if (id) {
      const ingredient = await getIngredientById(id);
      if (!ingredient) {
        return NextResponse.json(
          { success: false, message: 'Ingredient not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, ingredient });
    }

    const ingredients = category
      ? await getIngredientsByCategory(category)
      : await getAllIngredients();
    return NextResponse.json({ success: true, ingredients });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      aliases,
      category,
      safetyRating,
      benefits,
      concerns,
      bestForSkinTypes,
      avoidForSkinTypes,
      evidenceLevel,
      references,
    } = body;

    if (!name || !category || safetyRating === undefined || !evidenceLevel) {
      return NextResponse.json(
        { success: false, message: 'name, category, safetyRating, and evidenceLevel are required' },
        { status: 400 }
      );
    }

    const ingredient = await createIngredient({
      name,
      aliases: aliases || [],
      category,
      safetyRating,
      benefits: benefits || [],
      concerns: concerns || [],
      bestForSkinTypes: bestForSkinTypes || [],
      avoidForSkinTypes: avoidForSkinTypes || [],
      evidenceLevel,
      references: references || [],
    });

    return NextResponse.json({ success: true, ingredient }, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    const ingredient = await updateIngredient(id, updateData);
    if (!ingredient) {
      return NextResponse.json(
        { success: false, message: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ingredient });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'id is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteIngredient(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Ingredient deleted' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
