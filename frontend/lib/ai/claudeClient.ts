import Anthropic from '@anthropic-ai/sdk';
import { ITopic, ISkincareProduct, IProductScore, StrategyConfig } from '@/lib/types';
import { createOutlinePrompt } from './prompts/outlinePrompt';
import { createDraftPrompt } from './prompts/draftPrompt';
import { createSeoPrompt, SeoData } from './prompts/seoPrompt';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CLAUDE_MODEL = "claude-3-haiku-20240307";

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say "Connection successful" in exactly those words.' }],
    });
    
    const content = response.content[0];
    if (content.type === 'text' && content.text.includes('Connection successful')) {
      return { success: true, message: 'Claude API connected successfully' };
    }
    return { success: true, message: 'Claude API connected (response received)' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function generateOutlineAndAngle(
  topic: ITopic,
  products: ISkincareProduct[],
  scores: IProductScore[],
  strategyConfig?: StrategyConfig
): Promise<string[]> {
  const prompt = createOutlinePrompt(topic, products, scores, strategyConfig);
  
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    // Try to parse as JSON array
    const text = content.text.trim();
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback: split by newlines if not valid JSON
    return content.text
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
  }
}

export async function generateFullArticleDraft(
  topic: ITopic,
  outline: string[],
  products: ISkincareProduct[],
  scores: IProductScore[],
  strategyConfig?: StrategyConfig
): Promise<string> {
  const prompt = createDraftPrompt(topic, outline, products, scores, strategyConfig);
  
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}

export async function generateStrategyInsights(analysisData: {
  topPerformers: {
    successScore: number;
    engagementScore: number;
    seoScore: number;
    monetizationScore: number;
  }[];
  bottomPerformers: {
    successScore: number;
    engagementScore: number;
    seoScore: number;
    monetizationScore: number;
  }[];
  currentWeights: { engagement: number; seo: number; monetization: number };
  totalPosts: number;
  avgScores: {
    avgSuccessScore: number;
    avgEngagement: number;
    avgSeo: number;
    avgMonetization: number;
  } | null;
}): Promise<{
  summary: string;
  recommendations: string[];
  recommendedWeights: { engagement: number; seo: number; monetization: number } | null;
  contentRuleAdjustments: Record<string, unknown> | null;
  weeklyFocus: string;
}> {
  const prompt = `You are an AI content strategist analyzing blog performance data. 
  
  Current Strategy Weights:
  - Engagement: ${analysisData.currentWeights.engagement}
  - SEO: ${analysisData.currentWeights.seo}
  - Monetization: ${analysisData.currentWeights.monetization}

  Top Performing Posts (top 10%):
  ${JSON.stringify(analysisData.topPerformers, null, 2)}

  Bottom Performing Posts (bottom 10%):
  ${JSON.stringify(analysisData.bottomPerformers, null, 2)}

  Average Scores:
  ${JSON.stringify(analysisData.avgScores, null, 2)}

  Total Posts Analyzed: ${analysisData.totalPosts}

  Please analyze this data and provide:
  1. A brief summary of content performance patterns
  2. 3-5 specific recommendations for improvement
  3. Recommended weight adjustments (if any) for engagement/seo/monetization (should sum to 1.0)
  4. Content rule suggestions (intro length, FAQ count, etc.)
  5. A focus area for the coming week

  Respond in JSON format:
  {
    "summary": "...",
    "recommendations": ["...", "..."],
    "recommendedWeights": { "engagement": 0.4, "seo": 0.3, "monetization": 0.3 },
    "contentRuleAdjustments": { "introMaxWords": 150, "faqCount": 5 },
    "weeklyFocus": "..."
  }`;

  try {
    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const text = content.text.trim();
      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    }
    
    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error generating strategy insights:', error);
    // Return default values on error
    return {
      summary: 'Unable to generate AI insights at this time.',
      recommendations: ['Continue current strategy'],
      recommendedWeights: null,
      contentRuleAdjustments: null,
      weeklyFocus: 'Maintain consistency',
    };
  }
}

export async function generateSeoMetaAndSchema(
  draftBody: string,
  topic: ITopic,
  products: ISkincareProduct[]
): Promise<SeoData> {
  const prompt = createSeoPrompt(draftBody, topic, products);
  
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  try {
    const text = content.text.trim();
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as SeoData;
  } catch (error) {
    console.error('Failed to parse SEO data:', error);
    throw new Error('Failed to parse SEO metadata from Claude response');
  }
}

export { CLAUDE_MODEL };
