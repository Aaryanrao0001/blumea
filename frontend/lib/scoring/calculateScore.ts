import { IIngredient, ISkincareProduct, IProductScore } from '@/lib/types';
import { getIngredientsByNames } from '@/lib/db/repositories/ingredients';
import {
  SCORE_WEIGHTS,
  INGREDIENT_SCORES,
  EVIDENCE_WEIGHTS,
  SAFETY_RATING_MAP,
  SKIN_TYPES,
} from './config';

interface CalculatedScore {
  overallScore: number;
  beneficialScore: number;
  harmfulPenalty: number;
  concentrationScore: number;
  evidenceScore: number;
  skinTypeCompatibility: { [skinType: string]: number };
  pros: string[];
  cons: string[];
  bestFor: string[];
  avoidIf: string[];
}

function getSafetyCategory(rating: number): 'safe' | 'moderate' | 'risky' {
  const mapped = SAFETY_RATING_MAP[rating as keyof typeof SAFETY_RATING_MAP];
  if (mapped === 'unknown') return 'moderate';
  return mapped;
}

function calculateConcentrationWeight(index: number): number {
  // Earlier ingredients = higher concentration
  // First 5 ingredients get full weight, then decreasing
  if (index < 5) return 1.0;
  if (index < 10) return 0.7;
  if (index < 20) return 0.4;
  return 0.2;
}

export async function calculateProductScore(
  product: ISkincareProduct
): Promise<CalculatedScore> {
  const ingredientNames = product.ingredientNames;
  const matchedIngredients = await getIngredientsByNames(ingredientNames);
  
  const ingredientMap = new Map<string, IIngredient>();
  matchedIngredients.forEach((ing) => {
    ingredientMap.set(ing.name.toLowerCase(), ing);
    ing.aliases?.forEach((alias) => {
      ingredientMap.set(alias.toLowerCase(), ing);
    });
  });

  let beneficialScore = 0;
  let harmfulPenalty = 0;
  let concentrationScore = 0;
  let evidenceScore = 0;
  const skinTypeScores: { [key: string]: number } = {};
  const pros: string[] = [];
  const cons: string[] = [];
  const bestForSet = new Set<string>();
  const avoidIfSet = new Set<string>();

  // Initialize skin type scores
  SKIN_TYPES.forEach((type) => {
    skinTypeScores[type] = 50;
  });

  ingredientNames.forEach((ingredientName, index) => {
    const ingredient = ingredientMap.get(ingredientName.toLowerCase().trim());
    if (!ingredient) return;

    const concentrationWeight = calculateConcentrationWeight(index);
    const evidenceWeight = EVIDENCE_WEIGHTS[ingredient.evidenceLevel];
    const safetyCategory = getSafetyCategory(ingredient.safetyRating);
    const categoryScores =
      INGREDIENT_SCORES[ingredient.category as keyof typeof INGREDIENT_SCORES];

    // Handle fragrance special case
    if (ingredient.category === 'fragrance') {
      harmfulPenalty += (categoryScores as { penalty: number }).penalty * concentrationWeight;
      cons.push(`Contains fragrance: ${ingredient.name}`);
      skinTypeScores['sensitive'] -= 10;
      avoidIfSet.add('sensitive skin');
    } else {
      const score =
        categoryScores[safetyCategory as keyof typeof categoryScores] || 0;
      if (score > 0) {
        beneficialScore += score * concentrationWeight * evidenceWeight;
        if (ingredient.benefits.length > 0) {
          pros.push(`${ingredient.name}: ${ingredient.benefits[0]}`);
        }
      } else if (score < 0) {
        harmfulPenalty += score * concentrationWeight;
        if (ingredient.concerns.length > 0) {
          cons.push(`${ingredient.name}: ${ingredient.concerns[0]}`);
        }
      }
    }

    // Update skin type compatibility
    ingredient.bestForSkinTypes?.forEach((skinType) => {
      const normalizedType = skinType.toLowerCase();
      if (skinTypeScores[normalizedType] !== undefined) {
        skinTypeScores[normalizedType] += 5 * concentrationWeight;
        bestForSet.add(normalizedType);
      }
    });

    ingredient.avoidForSkinTypes?.forEach((skinType) => {
      const normalizedType = skinType.toLowerCase();
      if (skinTypeScores[normalizedType] !== undefined) {
        skinTypeScores[normalizedType] -= 8 * concentrationWeight;
        avoidIfSet.add(normalizedType);
      }
    });

    // Add to evidence score
    evidenceScore += evidenceWeight * concentrationWeight;
  });

  // Normalize scores to their max ranges
  beneficialScore = Math.min(beneficialScore, SCORE_WEIGHTS.beneficialMax);
  harmfulPenalty = Math.max(harmfulPenalty, SCORE_WEIGHTS.harmfulMax);
  concentrationScore = Math.min(
    (matchedIngredients.length / ingredientNames.length) * SCORE_WEIGHTS.concentrationMax,
    SCORE_WEIGHTS.concentrationMax
  );
  evidenceScore = Math.min(evidenceScore, SCORE_WEIGHTS.evidenceMax);

  // Calculate overall score
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      SCORE_WEIGHTS.baseScore +
        beneficialScore +
        harmfulPenalty +
        (concentrationScore / 2) +
        (evidenceScore / 2)
    )
  );

  // Normalize skin type compatibility to 0-100
  Object.keys(skinTypeScores).forEach((key) => {
    skinTypeScores[key] = Math.max(0, Math.min(100, skinTypeScores[key]));
  });

  // Deduplicate and limit pros/cons
  const uniquePros = Array.from(new Set(pros)).slice(0, 5);
  const uniqueCons = Array.from(new Set(cons)).slice(0, 5);

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    beneficialScore: Math.round(beneficialScore * 10) / 10,
    harmfulPenalty: Math.round(harmfulPenalty * 10) / 10,
    concentrationScore: Math.round(concentrationScore * 10) / 10,
    evidenceScore: Math.round(evidenceScore * 10) / 10,
    skinTypeCompatibility: skinTypeScores,
    pros: uniquePros,
    cons: uniqueCons,
    bestFor: Array.from(bestForSet),
    avoidIf: Array.from(avoidIfSet),
  };
}

export async function calculateAndSaveProductScore(
  product: ISkincareProduct,
  updateScore: (
    productId: string,
    data: Omit<IProductScore, '_id' | 'productId' | 'createdAt'>
  ) => Promise<IProductScore | null>
): Promise<IProductScore | null> {
  const calculated = await calculateProductScore(product);
  return updateScore(product._id.toString(), {
    ...calculated,
    lastCalculatedAt: new Date(),
  });
}
