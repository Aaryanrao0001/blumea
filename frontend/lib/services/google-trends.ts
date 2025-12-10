import { connectToDatabase } from '../db/mongoose';
import GoogleTrendsInsight from '../db/models/GoogleTrendsInsight';
import { IGoogleTrendsInsight } from '../types/intelligence';

// Note: Google Trends doesn't have an official free API
// This is a placeholder that would need to use a library like 'google-trends-api'
// or scraping. For now, we'll create a mock implementation that can be enhanced later.

// Simple linear regression for trend calculation
function calculateTrendDirection(dataPoints: { date: string; score: number }[]): {
  direction: 'rising' | 'falling' | 'stable';
  projected30dGrowth: number;
} {
  if (dataPoints.length < 2) {
    return { direction: 'stable', projected30dGrowth: 0 };
  }

  // Calculate simple moving average and slope
  const scores = dataPoints.map(d => d.score);
  const n = scores.length;
  
  // Calculate slope using least squares
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += scores[i];
    sumXY += i * scores[i];
    sumX2 += i * i;
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgScore = sumY / n;
  
  // Determine direction based on slope
  let direction: 'rising' | 'falling' | 'stable';
  if (Math.abs(slope) < 0.5) {
    direction = 'stable';
  } else if (slope > 0) {
    direction = 'rising';
  } else {
    direction = 'falling';
  }
  
  // Project 30-day growth
  const projected30dGrowth = avgScore > 0 ? (slope * 30 / avgScore) * 100 : 0;
  
  return { direction, projected30dGrowth };
}

export async function analyzeTrendsForKeyword(
  keyword: string,
  timeRange: '1-m' | '3-m' | '12-m' = '3-m'
): Promise<{ success: boolean; insight?: IGoogleTrendsInsight; error?: string }> {
  try {
    await connectToDatabase();
    
    // For now, we'll create a mock implementation
    // In production, you would use google-trends-api or similar
    
    // Generate mock data (this should be replaced with actual Google Trends data)
    const mockInterestData = generateMockInterestData(timeRange);
    const { direction, projected30dGrowth } = calculateTrendDirection(mockInterestData);
    
    const insightData = {
      keyword,
      timeRange: `today ${timeRange}` as 'today 1-m' | 'today 3-m' | 'today 12-m',
      interestOverTime: mockInterestData,
      relatedQueries: generateMockRelatedQueries(keyword),
      relatedTopics: generateMockRelatedTopics(keyword),
      trendDirection: direction,
      projected30dGrowth,
      lastUpdated: new Date(),
    };
    
    // Upsert the insight
    const insight = await GoogleTrendsInsight.findOneAndUpdate(
      { keyword, timeRange: `today ${timeRange}` },
      insightData,
      { upsert: true, new: true }
    ).lean();
    
    return { success: true, insight: insight as unknown as IGoogleTrendsInsight };
  } catch (error) {
    console.error('Error analyzing trends:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getTrendsInsights(filters?: {
  keyword?: string;
  trendDirection?: 'rising' | 'falling' | 'stable';
  minGrowth?: number;
  limit?: number;
}): Promise<IGoogleTrendsInsight[]> {
  try {
    await connectToDatabase();
    
    const query: any = {};
    
    if (filters?.keyword) {
      query.keyword = new RegExp(filters.keyword, 'i');
    }
    
    if (filters?.trendDirection) {
      query.trendDirection = filters.trendDirection;
    }
    
    if (filters?.minGrowth !== undefined) {
      query.projected30dGrowth = { $gte: filters.minGrowth };
    }
    
    const insights = await GoogleTrendsInsight.find(query)
      .sort({ projected30dGrowth: -1 })
      .limit(filters?.limit || 100)
      .lean();
    
    return insights as unknown as IGoogleTrendsInsight[];
  } catch (error) {
    console.error('Error getting trends insights:', error);
    return [];
  }
}

export async function getRisingKeywords(limit: number = 10): Promise<IGoogleTrendsInsight[]> {
  try {
    await connectToDatabase();
    
    const insights = await GoogleTrendsInsight.find({
      trendDirection: 'rising',
      projected30dGrowth: { $gte: 10 },
    })
      .sort({ projected30dGrowth: -1 })
      .limit(limit)
      .lean();
    
    return insights as unknown as IGoogleTrendsInsight[];
  } catch (error) {
    console.error('Error getting rising keywords:', error);
    return [];
  }
}

// Helper functions to generate mock data (replace with actual API calls)
function generateMockInterestData(timeRange: string): { date: string; score: number }[] {
  const days = timeRange === '1-m' ? 30 : timeRange === '3-m' ? 90 : 365;
  const data: { date: string; score: number }[] = [];
  
  const today = new Date();
  let baseScore = 50 + Math.random() * 30;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some randomness and trend
    baseScore = baseScore + (Math.random() - 0.4) * 5;
    baseScore = Math.max(0, Math.min(100, baseScore));
    
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.round(baseScore),
    });
  }
  
  return data;
}

function generateMockRelatedQueries(keyword: string): { keyword: string; type: 'rising' | 'top'; score: number }[] {
  const related = [
    `${keyword} routine`,
    `best ${keyword} products`,
    `${keyword} for oily skin`,
    `${keyword} benefits`,
    `${keyword} before after`,
  ];
  
  return related.map((kw, index) => ({
    keyword: kw,
    type: index < 2 ? 'rising' : 'top' as 'rising' | 'top',
    score: 100 - index * 15,
  }));
}

function generateMockRelatedTopics(keyword: string): { topic: string; score: number }[] {
  const topics = [
    'Skincare routine',
    'Anti-aging',
    'Moisturizer',
    'Serum',
    'Natural ingredients',
  ];
  
  return topics.map((topic, index) => ({
    topic,
    score: 90 - index * 10,
  }));
}
