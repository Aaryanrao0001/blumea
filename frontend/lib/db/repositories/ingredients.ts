import { connectToDatabase } from '../mongoose';
import Ingredient, { IIngredientDocument } from '../models/Ingredient';
import { IIngredient } from '@/lib/types';

export async function getAllIngredients(): Promise<IIngredient[]> {
  await connectToDatabase();
  const ingredients = await Ingredient.find().lean();
  return ingredients as unknown as IIngredient[];
}

export async function getIngredientByName(name: string): Promise<IIngredient | null> {
  await connectToDatabase();
  const ingredient = await Ingredient.findOne({ 
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { aliases: { $regex: new RegExp(`^${name}$`, 'i') } }
    ]
  }).lean();
  return ingredient as unknown as IIngredient | null;
}

export async function getIngredientById(id: string): Promise<IIngredient | null> {
  await connectToDatabase();
  const ingredient = await Ingredient.findById(id).lean();
  return ingredient as unknown as IIngredient | null;
}

export async function createIngredient(
  data: Omit<IIngredient, '_id' | 'createdAt' | 'updatedAt'>
): Promise<IIngredient> {
  await connectToDatabase();
  const ingredient = await Ingredient.create(data);
  return ingredient.toObject() as unknown as IIngredient;
}

export async function updateIngredient(
  id: string,
  data: Partial<Omit<IIngredient, '_id' | 'createdAt' | 'updatedAt'>>
): Promise<IIngredient | null> {
  await connectToDatabase();
  const ingredient = await Ingredient.findByIdAndUpdate(id, data, { new: true }).lean();
  return ingredient as unknown as IIngredient | null;
}

export async function deleteIngredient(id: string): Promise<boolean> {
  await connectToDatabase();
  const result = await Ingredient.findByIdAndDelete(id);
  return !!result;
}

export async function getIngredientsByNames(names: string[]): Promise<IIngredient[]> {
  await connectToDatabase();
  const regexPatterns = names.map(name => new RegExp(`^${name}$`, 'i'));
  const ingredients = await Ingredient.find({
    $or: [
      { name: { $in: regexPatterns } },
      { aliases: { $in: regexPatterns } }
    ]
  }).lean();
  return ingredients as unknown as IIngredient[];
}

export async function getIngredientsByCategory(
  category: IIngredientDocument['category']
): Promise<IIngredient[]> {
  await connectToDatabase();
  const ingredients = await Ingredient.find({ category }).lean();
  return ingredients as unknown as IIngredient[];
}

export async function bulkUpsertIngredients(
  ingredients: Omit<IIngredient, '_id' | 'createdAt' | 'updatedAt'>[]
): Promise<number> {
  await connectToDatabase();
  const operations = ingredients.map((ingredient) => ({
    updateOne: {
      filter: { name: ingredient.name },
      update: { $set: ingredient },
      upsert: true,
    },
  }));
  const result = await Ingredient.bulkWrite(operations);
  return result.upsertedCount + result.modifiedCount;
}
