import { NextRequest, NextResponse } from 'next/server';
import { bulkUpsertIngredients } from '@/lib/db/repositories/ingredients';
import { bulkUpsertSkincareProducts } from '@/lib/db/repositories/skincareProducts';
import { bulkUpsertTopics } from '@/lib/db/repositories/topics';
import { ingredientSeedData } from '@/lib/db/seed/ingredients';
import { productSeedData } from '@/lib/db/seed/products';
import { topicSeedData } from '@/lib/db/seed/topics';
import { connectToDatabase } from '@/lib/db/mongoose';
import Category from '@/lib/db/models/Category';
import Author from '@/lib/db/models/Author';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    // Verify admin password
    const authHeader = request.headers.get('authorization');
    const password = authHeader?.replace('Bearer ', '');
    
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Seed ingredients
    const ingredientsCount = await bulkUpsertIngredients(ingredientSeedData);

    // Seed products
    const productsCount = await bulkUpsertSkincareProducts(productSeedData);

    // Seed topics (without related product IDs for now)
    const topicsCount = await bulkUpsertTopics(
      topicSeedData.map((t) => ({ ...t, relatedProductIds: [] }))
    );

    // Ensure default categories exist
    const defaultCategories = [
      { title: 'Skincare', slug: 'skincare', description: 'Expert skincare tips and product reviews' },
      { title: 'Ingredients', slug: 'ingredients', description: 'Deep dives into skincare ingredients' },
      { title: 'Routines', slug: 'routines', description: 'Skincare routine guides and tips' },
      { title: 'Reviews', slug: 'reviews', description: 'Honest product reviews' },
    ];

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true }
      );
    }

    // Ensure default author exists
    await Author.findOneAndUpdate(
      { slug: 'blumea-team' },
      {
        $set: {
          name: 'Blumea Team',
          slug: 'blumea-team',
          bio: 'The Blumea editorial team brings you science-based skincare insights.',
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts: {
        ingredients: ingredientsCount,
        products: productsCount,
        topics: topicsCount,
        categories: defaultCategories.length,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
