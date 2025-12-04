import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSkincareProducts,
  getSkincareProductById,
  createSkincareProduct,
  updateSkincareProduct,
  deleteSkincareProduct,
  getSkincareProductsByCategory,
} from '@/lib/db/repositories/skincareProducts';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'cleanser' | 'moisturizer' | 'serum' | 'sunscreen' | 'treatment' | 'other' | null;
    const id = searchParams.get('id');

    if (id) {
      const product = await getSkincareProductById(id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: 'Product not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, product });
    }

    const products = category
      ? await getSkincareProductsByCategory(category)
      : await getAllSkincareProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
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
      brand,
      category,
      imageUrl,
      productUrl,
      affiliateLinks,
      ingredientListRaw,
      ingredientNames,
      skinTypes,
      price,
      currency,
    } = body;

    if (!name || !brand || !category || !imageUrl || !productUrl || !ingredientListRaw) {
      return NextResponse.json(
        { success: false, message: 'name, brand, category, imageUrl, productUrl, and ingredientListRaw are required' },
        { status: 400 }
      );
    }

    // Parse ingredient names from raw list if not provided
    const parsedIngredientNames = ingredientNames || ingredientListRaw
      .split(',')
      .map((i: string) => i.trim())
      .filter((i: string) => i.length > 0);

    const product = await createSkincareProduct({
      name,
      brand,
      slug: slugify(`${brand}-${name}`),
      category,
      imageUrl,
      productUrl,
      affiliateLinks: affiliateLinks || [],
      ingredientListRaw,
      ingredientNames: parsedIngredientNames,
      skinTypes: skinTypes || [],
      price,
      currency,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
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

    const product = await updateSkincareProduct(id, updateData);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
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

    const deleted = await deleteSkincareProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
