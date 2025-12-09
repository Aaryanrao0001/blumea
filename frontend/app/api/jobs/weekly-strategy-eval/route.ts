import { NextRequest, NextResponse } from 'next/server';
import { getCurrentConfig, updateConfig } from '@/lib/db/repositories/strategyConfig';
import { getTopPerformers, getBottomPerformers } from '@/lib/db/repositories/postPerformance';
import { getAllPostsPhase3 } from '@/lib/db/repositories/posts';
import { generateStrategyInsights } from '@/lib/ai/claudeClient';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Get current strategy config
    const currentConfig = await getCurrentConfig();
    
    // Get performance data from last 7 days
    const topPosts = await getTopPerformers(10);
    const bottomPosts = await getBottomPerformers(10);
    const { posts: allPosts } = await getAllPostsPhase3({ limit: 100 });
    
    // Prepare data for AI analysis
    const analysisData = {
      topPerformers: topPosts.map(p => ({
        successScore: p.successScore,
        engagementScore: p.engagementScore,
        seoScore: p.seoScore,
        monetizationScore: p.monetizationScore,
      })),
      bottomPerformers: bottomPosts.map(p => ({
        successScore: p.successScore,
        engagementScore: p.engagementScore,
        seoScore: p.seoScore,
        monetizationScore: p.monetizationScore,
      })),
      currentWeights: currentConfig.weights,
      totalPosts: allPosts.length,
      avgScores: calculateAverageScores(topPosts, bottomPosts),
    };

    // Generate AI insights (create this function in claudeClient.ts)
    const aiInsights = await generateStrategyInsights(analysisData);

    // Update strategy config with AI recommendations
    const configUpdate: Partial<Omit<typeof currentConfig, '_id'>> = {
      ...currentConfig,
      weights: aiInsights.recommendedWeights || currentConfig.weights,
    };
    
    // Only update contentRules if AI provides valid adjustments
    if (aiInsights.contentRuleAdjustments && 
        typeof aiInsights.contentRuleAdjustments === 'object' &&
        'introMaxWords' in aiInsights.contentRuleAdjustments) {
      configUpdate.contentRules = aiInsights.contentRuleAdjustments as typeof currentConfig.contentRules;
    }
    
    const updatedConfig = await updateConfig(configUpdate);

    return NextResponse.json({
      success: true,
      message: 'Weekly strategy evaluation completed',
      insights: aiInsights,
      updatedConfig,
    });
  } catch (error) {
    console.error('Weekly strategy evaluation failed:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function calculateAverageScores(topPosts: {
  successScore: number;
  engagementScore: number;
  seoScore: number;
  monetizationScore: number;
}[], bottomPosts: {
  successScore: number;
  engagementScore: number;
  seoScore: number;
  monetizationScore: number;
}[]) {
  // Calculate average scores for analysis
  const allPosts = [...topPosts, ...bottomPosts];
  if (allPosts.length === 0) return null;
  
  return {
    avgSuccessScore: allPosts.reduce((sum, p) => sum + p.successScore, 0) / allPosts.length,
    avgEngagement: allPosts.reduce((sum, p) => sum + p.engagementScore, 0) / allPosts.length,
    avgSeo: allPosts.reduce((sum, p) => sum + p.seoScore, 0) / allPosts.length,
    avgMonetization: allPosts.reduce((sum, p) => sum + p.monetizationScore, 0) / allPosts.length,
  };
}

// GET endpoint for testing (no auth required in development)
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Get current strategy config
    const currentConfig = await getCurrentConfig();
    
    // Get performance data
    const topPosts = await getTopPerformers(10);
    const bottomPosts = await getBottomPerformers(10);
    
    return NextResponse.json({
      message: 'Weekly strategy evaluation endpoint (test mode)',
      currentConfig,
      topPerformersCount: topPosts.length,
      bottomPerformersCount: bottomPosts.length,
    });
  } catch (error) {
    console.error('Error fetching strategy data:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
