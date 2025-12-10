import Anthropic from '@anthropic-ai/sdk';
import { connectToDatabase } from '../db/mongoose';
import { getTopOpportunities } from './opportunity-calculator';
import { getRisingKeywords } from './google-trends';
import { getTopRedditKeywords } from './reddit-scraper';
import { IStrategyReport } from '../types/intelligence';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateStrategyReport(): Promise<{
  success: boolean;
  report?: IStrategyReport;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    // Gather intelligence data
    const topOpportunities = await getTopOpportunities(10, 50);
    const risingKeywords = await getRisingKeywords(10);
    const redditKeywords = await getTopRedditKeywords(15);
    
    // Build context for Claude
    const context = `
Generate a strategic content report for a skincare blog based on the following intelligence data:

TOP OPPORTUNITIES (Top 10 by score):
${topOpportunities.map((o, i) => `${i + 1}. ${o.keyword} (Score: ${o.score}, Reddit mentions: ${o.redditMentions}, Trend growth: ${o.trendGrowth30d}%)`).join('\n')}

RISING KEYWORDS FROM GOOGLE TRENDS:
${risingKeywords.map((k, i) => `${i + 1}. ${k.keyword} (Growth: ${k.projected30dGrowth}%)`).join('\n')}

TRENDING ON REDDIT:
${redditKeywords.map((k, i) => `${i + 1}. ${k.keyword} (${k.count} mentions)`).join('\n')}

Provide:
1. A brief executive summary (2-3 sentences)
2. Top 5 content recommendations for the coming week
3. Emerging topics to watch
4. Competitor insights based on search data
5. Weekly focus recommendation

Respond in JSON format:
{
  "summary": "...",
  "contentRecommendations": ["...", "..."],
  "emergingTopics": ["...", "..."],
  "competitorInsights": ["...", "..."],
  "weeklyFocus": "..."
}
`;

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{ role: 'user', content: context }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format');
    }

    const text = content.text.trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResponse = JSON.parse(cleaned);

    // Build full report
    const report: IStrategyReport = {
      generatedAt: new Date(),
      weeklyTrends: risingKeywords.map(k => k.keyword),
      topOpportunities: topOpportunities.slice(0, 5),
      contentRecommendations: aiResponse.contentRecommendations || [],
      competitorInsights: aiResponse.competitorInsights || [],
      emergingTopics: aiResponse.emergingTopics || [],
      fullReport: JSON.stringify(aiResponse, null, 2),
    };

    return { success: true, report };
  } catch (error) {
    console.error('Error generating strategy report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
