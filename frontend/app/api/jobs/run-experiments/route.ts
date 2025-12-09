import { NextRequest, NextResponse } from 'next/server';
import { getRunningExperiments, concludeExperiment } from '@/lib/db/repositories/postExperiments';

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Calculate statistical significance using a simple z-test for proportions
 */
function calculateSignificance(
  conversionsA: number,
  impressionsA: number,
  conversionsB: number,
  impressionsB: number
): { pValue: number; winner: 'A' | 'B' | 'none' } {
  if (impressionsA === 0 || impressionsB === 0) {
    return { pValue: 1, winner: 'none' };
  }

  const pA = conversionsA / impressionsA;
  const pB = conversionsB / impressionsB;
  const pPool = (conversionsA + conversionsB) / (impressionsA + impressionsB);
  
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / impressionsA + 1 / impressionsB));
  
  if (se === 0) {
    return { pValue: 1, winner: 'none' };
  }
  
  const zScore = Math.abs(pA - pB) / se;
  
  // Approximate p-value from z-score (two-tailed)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  const winner = pA > pB ? 'A' : pB > pA ? 'B' : 'none';
  
  return { pValue, winner };
}

// Approximate normal CDF using error function approximation
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const experiments = await getRunningExperiments();

    const results = {
      evaluated: 0,
      concluded: 0,
      stillRunning: 0,
      details: [] as unknown[],
    };

    for (const experiment of experiments) {
      results.evaluated++;

      // Check if all variants have enough impressions
      const allVariantsReady = experiment.variants.every(
        v => v.impressions >= experiment.minImpressionsPerVariant
      );

      if (!allVariantsReady) {
        results.stillRunning++;
        continue;
      }

      // Find best variant based on CTR (clicks / impressions)
      const variantsWithCTR = experiment.variants.map(v => ({
        ...v,
        ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
        conversionRate: v.impressions > 0 ? v.conversions / v.impressions : 0,
      }));

      variantsWithCTR.sort((a, b) => b.conversionRate - a.conversionRate);

      if (variantsWithCTR.length < 2) {
        continue;
      }

      const best = variantsWithCTR[0];
      const second = variantsWithCTR[1];

      // Calculate statistical significance
      const { pValue, winner } = calculateSignificance(
        best.conversions,
        best.impressions,
        second.conversions,
        second.impressions
      );

      const isSignificant = pValue < (1 - experiment.confidenceThreshold);

      if (isSignificant && winner !== 'none') {
        // Conclude the experiment
        await concludeExperiment(
          experiment._id.toString(),
          best.variantId
        );

        results.concluded++;
        results.details.push({
          experimentId: experiment._id,
          postId: experiment.postId,
          type: experiment.experimentType,
          winner: best.variantId,
          winnerValue: best.value,
          pValue,
          improvement: `${((best.conversionRate - second.conversionRate) / second.conversionRate * 100).toFixed(1)}%`,
        });
      } else {
        results.stillRunning++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Evaluated ${results.evaluated} experiments`,
      results,
    });
  } catch (error) {
    console.error('Error running experiments job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
