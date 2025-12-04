export const SCORE_WEIGHTS = {
  baseScore: 50,
  beneficialMax: 40,
  harmfulMax: -40,
  concentrationMax: 20,
  evidenceMax: 20,
};

export const INGREDIENT_SCORES = {
  active: { safe: 8, moderate: 5, risky: -5 },
  emollient: { safe: 3, moderate: 2, risky: -2 },
  fragrance: { penalty: -8 },
  preservative: { safe: 0, moderate: -3, risky: -8 },
  surfactant: { safe: 2, moderate: 0, risky: -3 },
  other: { safe: 1, moderate: 0, risky: -2 },
};

export const EVIDENCE_WEIGHTS = {
  strong: 1.0,
  moderate: 0.7,
  limited: 0.4,
  anecdotal: 0.2,
};

export const SAFETY_RATING_MAP = {
  0: 'unknown',
  1: 'risky',
  2: 'risky',
  3: 'moderate',
  4: 'safe',
  5: 'safe',
} as const;

export const SKIN_TYPES = [
  'oily',
  'dry',
  'combination',
  'sensitive',
  'normal',
  'acne-prone',
  'mature',
];
