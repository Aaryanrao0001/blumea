import { connectToDatabase } from '../db/mongoose';
import { getTopOpportunities, markOpportunityActioned } from './opportunity-calculator';
import { createTopic } from '../db/repositories/topics';
import ContentJob from '../db/models/ContentJob';

export async function triggerAutoContentGeneration(
  count: number = 3,
  minScore: number = 70
): Promise<{
  success: boolean;
  jobsCreated: number;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    // Get top opportunities
    const opportunities = await getTopOpportunities(count, minScore);
    
    if (opportunities.length === 0) {
      return {
        success: true,
        jobsCreated: 0,
        error: 'No opportunities found with the specified criteria',
      };
    }
    
    let jobsCreated = 0;
    
    for (const opportunity of opportunities) {
      // Create a new Topic from the opportunity
      const title = opportunity.title || `${opportunity.keyword} Guide`;
      const slug = opportunity.keyword.toLowerCase().replace(/\s+/g, '-');
      
      const topic = await createTopic({
        title,
        slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
        primaryKeyword: opportunity.keyword,
        secondaryKeywords: opportunity.relatedKeywords.slice(0, 5),
        ideaType: 'trend',
        source: 'other',
        trendScore: Math.min(100, opportunity.score + 10),
        monetizationScore: 50,
        difficultyScore: 100 - opportunity.competitorStrength,
        status: 'selected',
        relatedProductIds: [],
      });
      
      // Create a ContentJob for this topic
      await ContentJob.create({
        topicId: topic._id,
        targetPostType: 'guide',
        status: 'pending',
        claudeModel: process.env.CLAUDE_MODEL || 'claude-3-haiku-20240307',
        scheduledFor: new Date(),
      });
      
      // Mark opportunity as actioned
      await markOpportunityActioned(opportunity._id.toString());
      
      jobsCreated++;
    }
    
    return {
      success: true,
      jobsCreated,
    };
  } catch (error) {
    console.error('Error in auto content generation:', error);
    return {
      success: false,
      jobsCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
