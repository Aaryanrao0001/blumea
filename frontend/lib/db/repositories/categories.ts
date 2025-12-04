import { connectToDatabase } from '../mongoose';
import Category from '../models/Category';
import { ICategory } from '@/lib/types';

export async function getAllCategories(): Promise<ICategory[]> {
  await connectToDatabase();
  const categories = await Category.find().lean();
  return categories as unknown as ICategory[];
}

export async function getCategoryBySlug(slug: string): Promise<ICategory | null> {
  await connectToDatabase();
  const category = await Category.findOne({ slug }).lean();
  return category as unknown as ICategory | null;
}

export async function createCategory(
  data: Omit<ICategory, '_id'>
): Promise<ICategory> {
  await connectToDatabase();
  const category = await Category.create(data);
  return category.toObject() as unknown as ICategory;
}

export async function getCategoriesWithPostCount(): Promise<
  (ICategory & { postCount: number })[]
> {
  await connectToDatabase();
  
  // This would require aggregation with Post model
  // For now, return categories without count
  const categories = await Category.find().lean();
  return categories.map((cat) => ({
    ...cat,
    postCount: 0,
  })) as unknown as (ICategory & { postCount: number })[];
}
