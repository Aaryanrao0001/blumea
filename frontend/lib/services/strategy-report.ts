import Anthropic from '@anthropic-ai/sdk';
import { connectToDatabase } from '../db/mongoose';
import { getTopOpportunities } from './opportunity-calculator';
import { getRisingKeywords } from './google-trends';
import { getTopRedditKeywords } from './reddit-scraper';
import { IStrategyReport } from '../types/intelligence';
import StrategyHistory, { IStrategyHistory, IStrategyRecommendation } from '../db/models/StrategyHistory';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function getWeekBounds(date: Date = new Date()): { weekStart: Date; weekEnd: Date } {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
  weekEnd.setHours(23, 59, 59, 999);
  
  return { weekStart, weekEnd };
}

async function getPreviousWeekReport(): Promise<IStrategyHistory | null> {
  try {
    const { weekStart } = getWeekBounds();
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(weekStart.getDate() - 7);
    
    const previousReport = await StrategyHistory.findOne({
      weekStart: previousWeekStart
    }).lean();
    
    return previousReport as unknown as IStrategyHistory | null;
  } catch (error) {
    console.error('Error fetching previous week report:', error);
    return null;
  }
}

export async function generateStrategyReport(saveToHistory: boolean = true): Promise<{
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
    
    // Get previous week's report for comparison
    const previousReport = await getPreviousWeekReport();
    
    // Calculate metrics
    const totalOpportunities = topOpportunities.length;
    const avgOpportunityScore = totalOpportunities > 0 
      ? topOpportunities.reduce((sum, o) => sum + o.score, 0) / totalOpportunities 
      : 0;
    const redditBuzzScore = redditKeywords.reduce((sum, k) => sum + k.count, 0);
    
    // Build comparison context
    let comparisonContext = '';
    if (previousReport) {
      const scoreChange = avgOpportunityScore - previousReport.avgOpportunityScore;
      comparisonContext = `

COMPARISON TO LAST WEEK:
- Average opportunity score changed by ${scoreChange > 0 ? '+' : ''}${scoreChange.toFixed(1)} (from ${previousReport.avgOpportunityScore.toFixed(1)} to ${avgOpportunityScore.toFixed(1)})
- Total opportunities: ${totalOpportunities} (previous: ${previousReport.totalOpportunities})
- Reddit buzz score: ${redditBuzzScore} (previous: ${previousReport.redditBuzzScore})
- Previous week's summary: ${previousReport.summary}
- Previous emerging topics: ${previousReport.emergingTopics.join(', ')}
`;
    }
    
    // Build context for Claude
    const context = `
Generate a strategic content report for a skincare blog based on the following intelligence data:

TOP OPPORTUNITIES (Top 10 by score):
${topOpportunities.map((o, i) => `${i + 1}. ${o.keyword} (Score: ${o.score}, Reddit mentions: ${o.redditMentions}, Trend growth: ${o.trendGrowth30d}%)`).join('\n')}

RISING KEYWORDS FROM GOOGLE TRENDS:
${risingKeywords.map((k, i) => `${i + 1}. ${k.keyword} (Growth: ${k.projected30dGrowth}%)`).join('\n')}

TRENDING ON REDDIT:
${redditKeywords.map((k, i) => `${i + 1}. ${k.keyword} (${k.count} mentions)`).join('\n')}
${comparisonContext}

Provide a comprehensive strategy report with:
1. Executive summary (2-3 sentences)
2. Detailed recommendations with reasoning backed by the data above
3. Emerging topics to watch
4. Competitor insights based on search data
5. Topics to avoid and why
6. If comparison data is available, note what improved, declined, or remained unchanged

For recommendations, include:
- Type (create_content, refresh_content, target_keyword, or avoid_topic)
- Description
- Priority (high, medium, low)
- Detailed reasoning citing specific data points
- Confidence level (high, medium, low)
- Data points used (as array of strings)

Respond in JSON format:
{
  "summary": "...",
  "recommendations": [
    {
      "type": "create_content",
      "description": "...",
      "priority": "high",
      "reasoning": "Based on X mentions on Reddit and Y% growth in trends...",
      "confidence": "high",
      "dataPoints": ["Reddit mentions: 50", "Trend growth: 35%"]
    }
  ],
  "emergingTopics": ["...", "..."],
  "competitorInsights": ["...", "..."],
  "weeklyFocus": "...",
  "whatToAvoid": [
    { "topic": "...", "reason": "..." }
  ]
}
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
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
      contentRecommendations: aiResponse.recommendations?.map((r: any) => r.description) || aiResponse.contentRecommendations || [],
      competitorInsights: aiResponse.competitorInsights || [],
      emergingTopics: aiResponse.emergingTopics || [],
      fullReport: JSON.stringify(aiResponse, null, 2),
    };

    // Save to history if requested
    if (saveToHistory) {
      const { weekStart, weekEnd } = getWeekBounds();
      
      // Build comparison data
      let comparedToLastWeek;
      if (previousReport) {
        const improved: string[] = [];
        const declined: string[] = [];
        const unchanged: string[] = [];
        
        const scoreChange = avgOpportunityScore - previousReport.avgOpportunityScore;
        if (scoreChange > 5) improved.push('Average opportunity score increased');
        else if (scoreChange < -5) declined.push('Average opportunity score decreased');
        else unchanged.push('Average opportunity score stable');
        
        if (redditBuzzScore > previousReport.redditBuzzScore * 1.1) improved.push('Reddit engagement increased');
        else if (redditBuzzScore < previousReport.redditBuzzScore * 0.9) declined.push('Reddit engagement decreased');
        else unchanged.push('Reddit engagement stable');
        
        comparedToLastWeek = {
          improved,
          declined,
          unchanged,
          opportunityScoreChange: scoreChange,
          previousReportId: previousReport._id,
        };
      }
      
      await StrategyHistory.create({
        reportDate: new Date(),
        weekStart,
        weekEnd,
        totalOpportunities,
        avgOpportunityScore,
        topKeywords: topOpportunities.slice(0, 10).map(o => o.keyword),
        topTrendingIngredients: [], // Could be extracted from opportunities
        redditBuzzScore,
        summary: aiResponse.summary || '',
        weeklyTrends: risingKeywords.map(k => k.keyword),
        emergingTopics: aiResponse.emergingTopics || [],
        recommendations: (aiResponse.recommendations || []) as IStrategyRecommendation[],
        competitorInsights: aiResponse.competitorInsights || [],
        whatToAvoid: aiResponse.whatToAvoid || [],
        comparedToLastWeek,
        fullReportMarkdown: JSON.stringify(aiResponse, null, 2),
      });
    }

    return { success: true, report };
  } catch (error) {
    console.error('Error generating strategy report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getHistoricalReports(limit: number = 10): Promise<IStrategyHistory[]> {
  try {
    await connectToDatabase();
    
    const reports = await StrategyHistory.find()
      .sort({ weekStart: -1 })
      .limit(limit)
      .lean();
    
    return reports as unknown as IStrategyHistory[];
  } catch (error) {
    console.error('Error fetching historical reports:', error);
    return [];
  }
}

export async function getReportByWeek(weekStart: Date): Promise<IStrategyHistory | null> {
  try {
    await connectToDatabase();
    
    const report = await StrategyHistory.findOne({
      weekStart: {
        $gte: weekStart,
        $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    }).lean();
    
    return report as unknown as IStrategyHistory | null;
  } catch (error) {
    console.error('Error fetching report by week:', error);
    return null;
  }
}
