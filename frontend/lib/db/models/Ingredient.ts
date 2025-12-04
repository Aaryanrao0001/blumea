import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IIngredient {
  _id: Types.ObjectId;
  name: string;
  aliases: string[];
  category: "active" | "emollient" | "fragrance" | "preservative" | "surfactant" | "other";
  safetyRating: 0 | 1 | 2 | 3 | 4 | 5;
  benefits: string[];
  concerns: string[];
  bestForSkinTypes: string[];
  avoidForSkinTypes: string[];
  evidenceLevel: "strong" | "moderate" | "limited" | "anecdotal";
  references?: string[];
  updatedAt: Date;
  createdAt: Date;
}

export interface IIngredientDocument extends Omit<IIngredient, '_id'>, Document {}

const IngredientSchema = new Schema<IIngredientDocument>({
  name: { type: String, required: true, unique: true },
  aliases: [{ type: String }],
  category: { type: String, enum: ["active", "emollient", "fragrance", "preservative", "surfactant", "other"], required: true },
  safetyRating: { type: Number, min: 0, max: 5, required: true },
  benefits: [{ type: String }],
  concerns: [{ type: String }],
  bestForSkinTypes: [{ type: String }],
  avoidForSkinTypes: [{ type: String }],
  evidenceLevel: { type: String, enum: ["strong", "moderate", "limited", "anecdotal"], required: true },
  references: [{ type: String }],
}, { timestamps: true });

export const Ingredient: Model<IIngredientDocument> = mongoose.models.Ingredient || mongoose.model<IIngredientDocument>('Ingredient', IngredientSchema);
export default Ingredient;
