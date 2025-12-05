import { connectToDatabase } from '../mongoose';
import SkincareProduct from '../models/SkincareProduct';
import { ISkincareProduct } from '@/lib/types';

export async function getAllSkincareProducts(): Promise<ISkincareProduct[]> {
  await connectToDatabase();
  const products = await SkincareProduct.find().lean();
  return products as unknown as ISkincareProduct[];
}

export async function getSkincareProductBySlug(slug: string): Promise<ISkincareProduct | null> {
  await connectToDatabase();
  const product = await SkincareProduct.findOne({ slug }).lean();
  return product as unknown as ISkincareProduct | null;
}

export async function getSkincareProductById(id: string): Promise<ISkincareProduct | null> {
  await connectToDatabase();
  const product = await SkincareProduct.findById(id).lean();
  return product as unknown as ISkincareProduct | null;
}

export async function createSkincareProduct(
  data: Omit<ISkincareProduct, '_id' | 'createdAt' | 'updatedAt'>
): Promise<ISkincareProduct> {
  await connectToDatabase();
  const product = await SkincareProduct.create(data);
  return product.toObject() as unknown as ISkincareProduct;
}

export async function updateSkincareProduct(
  id: string,
  data: Partial<Omit<ISkincareProduct, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<ISkincareProduct | null> {
  await connectToDatabase();
  const product = await SkincareProduct.findByIdAndUpdate(id, data, { new: true }).lean();
  return product as unknown as ISkincareProduct | null;
}

export async function deleteSkincareProduct(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await SkincareProduct.findByIdAndDelete(id);
  return !!result;
}

export async function getSkincareProductsByIds(ids: string[]): Promise<ISkincareProduct[]> {
  await connectToDatabase();
  const products = await SkincareProduct.find({ _id: { $in: ids } }).lean();
  return products as unknown as ISkincareProduct[];
}

export async function getSkincareProductsByCategory(
  category: ISkincareProduct['category']
): Promise<ISkincareProduct[]> {
  await connectToDatabase();
  const products = await SkincareProduct.find({ category }).lean();
  return products as unknown as ISkincareProduct[];
}

export async function searchSkincareProducts(query: string): Promise<ISkincareProduct[]> {
  await connectToDatabase();
  const products = await SkincareProduct.find({
    $text: { $search: query },
  }).lean();
  return products as unknown as ISkincareProduct[];
}

export async function bulkUpsertSkincareProducts(
  products: Omit<ISkincareProduct, '_id' | 'createdAt' | 'updatedAt'>[]
): Promise<number> {
  await connectToDatabase();
  const operations = products.map((product) => ({
    updateOne: {
      filter: { slug: product.slug },
      update: { $set: product },
      upsert: true,
    },
  }));
  const result = await SkincareProduct.bulkWrite(operations);
  return result.upsertedCount + result.modifiedCount;
}
