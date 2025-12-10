import { connectToDatabase } from '../db/mongoose';
import TopicOpportunity from '../db/models/TopicOpportunity';
import RedditInsight from '../db/models/RedditInsight';
import GoogleTrendsInsight from '../db/models/GoogleTrendsInsight';
import SerpInsight from '../db/models/SerpInsight';
import { ITopicOpportunity } from '../types/intelligence';

interface OpportunitySignals {
  keyword: string;
  redditMentions: number;
  redditSentiment: number;
  trendGrowth30d: number;
  searchVolumeIndicator: number;
  competitorStrength: number;
  paaQuestions: string[];
  relatedKeywords: string[];
}

/**
 * Calculate opportunity score using formula:
 * OpportunityScore = 
 *   (SearchIntentScore * 0.4) +
 *   (TrendGrowthScore * 0.3) +
 *   (RedditBuzzScore * 0.2) +
 *   (CompetitionWeaknessScore * 0.1)
 */
function calculateOpportunityScore(signals: OpportunitySignals): number {
  // Search Intent Score (0-100)
  // Based on search volume indicator and PAA questions
  const searchIntentScore = Math.min(100, signals.searchVolumeIndicator * 0.7 + signals.paaQuestions.length * 5);
  
  // Trend Growth Score (0-100)
  // Normalize trend growth to 0-100 scale
  const trendGrowthScore = Math.min(100, Math.max(0, 50 + signals.trendGrowth30d));
  
  // Reddit Buzz Score (0-100)
  // Combine mentions and sentiment
  const mentionScore = Math.min(100, signals.redditMentions * 2);
  const sentimentBonus = signals.redditSentiment * 20;
  const redditBuzzScore = Math.min(100, mentionScore + sentimentBonus);
  
  // Competition Weakness Score (0-100)
  // Inverse of competitor strength
  const competitionWeaknessScore = 100 - signals.competitorStrength;
  
  // Calculate weighted score
  const opportunityScore = 
    (searchIntentScore * 0.4) +
    (trendGrowthScore * 0.3) +
    (redditBuzzScore * 0.2) +
    (competitionWeaknessScore * 0.1);
  
  return Math.round(opportunityScore);
}

function determineRecommendedAction(score: number): 'create_new' | 'update_existing' | 'ignore' {
  if (score >= 70) {
    return 'create_new';
  } else if (score >= 50) {
    return 'update_existing';
  } else {
    return 'ignore';
  }
}

export async function calculateOpportunities(keywords?: string[]): Promise<{
  success: boolean;
  opportunities: ITopicOpportunity[];
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    let keywordsToAnalyze: string[] = [];
    
    if (keywords && keywords.length > 0) {
      keywordsToAnalyze = keywords;
    } else {
      // Get keywords from recent data
      const recentReddit = await RedditInsight.find()
        .sort({ timestamp: -1 })
        .limit(500)
        .lean();
      
      const keywordSet = new Set<string>();
      recentReddit.forEach((insight: any) => {
        insight.keywords?.forEach((kw: string) => keywordSet.add(kw));
      });
      
      keywordsToAnalyze = Array.from(keywordSet).slice(0, 50);
    }
    
    const opportunities: ITopicOpportunity[] = [];
    
    for (const keyword of keywordsToAnalyze) {
      // Gather signals from all sources
      const signals = await gatherSignals(keyword);
      
      // Calculate opportunity score
      const score = calculateOpportunityScore(signals);
      
      // Skip low-value opportunities
      if (score < 40) {
        continue;
      }
      
      const recommendedAction = determineRecommendedAction(score);
      
      // Create or update opportunity
      const opportunity = await TopicOpportunity.findOneAndUpdate(
        { keyword },
        {
          keyword,
          title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Content Opportunity`,
          score,
          redditMentions: signals.redditMentions,
          redditSentiment: signals.redditSentiment,
          trendGrowth30d: signals.trendGrowth30d,
          searchVolumeIndicator: signals.searchVolumeIndicator,
          competitorStrength: signals.competitorStrength,
          paaQuestions: signals.paaQuestions,
          relatedKeywords: signals.relatedKeywords,
          recommendedAction,
          status: 'pending',
        },
        { upsert: true, new: true }
      ).lean();
      
      opportunities.push(opportunity as unknown as ITopicOpportunity);
    }
    
    // Sort by score descending
    opportunities.sort((a, b) => b.score - a.score);
    
    return { success: true, opportunities };
  } catch (error) {
    console.error('Error calculating opportunities:', error);
    return {
      success: false,
      opportunities: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function gatherSignals(keyword: string): Promise<OpportunitySignals> {
  // Gather Reddit signals
  const redditInsights = await RedditInsight.find({
    $or: [
      { keywords: keyword },
      { title: new RegExp(keyword, 'i') },
    ],
  }).lean();
  
  const redditMentions = redditInsights.length;
  const redditSentiment = redditInsights.length > 0
    ? redditInsights.reduce((sum: number, insight: any) => sum + insight.sentiment, 0) / redditInsights.length
    : 0.5;
  
  // Gather Google Trends signals
  const trendsInsight = await GoogleTrendsInsight.findOne({
    keyword: new RegExp(keyword, 'i'),
  }).lean();
  
  const trendGrowth30d = trendsInsight?.projected30dGrowth || 0;
  
  // Gather SERP signals
  const serpInsight = await SerpInsight.findOne({
    keyword: new RegExp(keyword, 'i'),
  }).lean();
  
  const paaQuestions = serpInsight?.peopleAlsoAsk.map((paa: any) => paa.question) || [];
  const relatedKeywords = serpInsight?.relatedSearches || [];
  
  // Calculate search volume indicator (0-100)
  // Based on number of search results, PAA questions, and autocomplete suggestions
  const searchVolumeIndicator = Math.min(100, 
    (serpInsight?.searchResults.length || 0) * 5 +
    paaQuestions.length * 10 +
    (serpInsight?.autocomplete.length || 0) * 5
  );
  
  // Calculate competitor strength (0-100)
  // Based on domain authority of top results
  const highAuthorityDomains = ['healthline.com', 'webmd.com', 'mayoclinic.org', 'harvard.edu'];
  const topResults = serpInsight?.searchResults.slice(0, 3) || [];
  const competitorStrength = topResults.filter((result: any) => 
    highAuthorityDomains.some(domain => result.domain.includes(domain))
  ).length * 33; // Each high-authority domain in top 3 adds 33 points
  
  return {
    keyword,
    redditMentions,
    redditSentiment,
    trendGrowth30d,
    searchVolumeIndicator,
    competitorStrength,
    paaQuestions,
    relatedKeywords,
  };
}

export async function getTopOpportunities(limit: number = 20, minScore: number = 50): Promise<ITopicOpportunity[]> {
  try {
    await connectToDatabase();
    
    const opportunities = await TopicOpportunity.find({
      status: 'pending',
      score: { $gte: minScore },
    })
      .sort({ score: -1 })
      .limit(limit)
      .lean();
    
    return opportunities as unknown as ITopicOpportunity[];
  } catch (error) {
    console.error('Error getting top opportunities:', error);
    return [];
  }
}

export async function markOpportunityActioned(opportunityId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    await TopicOpportunity.findByIdAndUpdate(opportunityId, {
      status: 'actioned',
    });
    
    return true;
  } catch (error) {
    console.error('Error marking opportunity actioned:', error);
    return false;
  }
}

export async function dismissOpportunity(opportunityId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    await TopicOpportunity.findByIdAndUpdate(opportunityId, {
      status: 'dismissed',
    });
    
    return true;
  } catch (error) {
    console.error('Error dismissing opportunity:', error);
    return false;
  }
}
