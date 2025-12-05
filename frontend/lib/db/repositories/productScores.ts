import { connectToDatabase } from '../mongoose';
import ProductScore from '../models/ProductScore';
import { IProductScore } from '@/lib/types';

export async function getProductScoreByProductId(productId: string): Promise<IProductScore | null> {
  await connectToDatabase();
  const score = await ProductScore.findOne({ productId }).lean();
  return score as unknown as IProductScore | null;
}

export async function getProductScoreById(id: string): Promise<IProductScore | null> {
  await connectToDatabase();
  const score = await ProductScore.findById(id).lean();
  return score as unknown as IProductScore | null;
}

export async function createProductScore(
  data: Omit<IProductScore, '_id' | 'createdAt'>
): Promise<IProductScore> {
  await connectToDatabase();
  const score = await ProductScore.create(data);
  return score.toObject() as unknown as IProductScore;
}

export async function updateProductScore(
  productId: string,
  data: Omit<IProductScore, '_id' | 'productId' | 'createdAt'>
): Promise<IProductScore | null> {
  await connectToDatabase();
  const score = await ProductScore.findOneAndUpdate(
    { productId },
    { ...data, lastCalculatedAt: new Date() },
    { new: true, upsert: true }
  ).lean();
  return score as unknown as IProductScore | null;
}

export async function deleteProductScore(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await ProductScore.findByIdAndDelete(id);
  return !!result;
}

export async function getProductScoresByProductIds(productIds: string[]): Promise<IProductScore[]> {
  await connectToDatabase();
  const scores = await ProductScore.find({ productId: { $in: productIds } }).lean();
  return scores as unknown as IProductScore[];
}

export async function getTopScoredProducts(limit: number = 10): Promise<IProductScore[]> {
  await connectToDatabase();
  const scores = await ProductScore.find()
    .sort({ overallScore: -1 })
    .limit(limit)
    .lean();
  return scores as unknown as IProductScore[];
}

export async function getProductScoresByOverallScoreRange(
  minScore: number,
  maxScore: number
): Promise<IProductScore[]> {
  await connectToDatabase();
  const scores = await ProductScore.find({
    overallScore: { $gte: minScore, $lte: maxScore },
  }).lean();
  return scores as unknown as IProductScore[];
}
