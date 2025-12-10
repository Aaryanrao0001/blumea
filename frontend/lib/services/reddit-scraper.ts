import Anthropic from '@anthropic-ai/sdk';
import { connectToDatabase } from '../db/mongoose';
import RedditInsight from '../db/models/RedditInsight';
import { IRedditInsight } from '../types/intelligence';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Skincare subreddits to scrape
const SKINCARE_SUBREDDITS = [
  'SkincareAddiction',
  'AsianBeauty',
  '30PlusSkinCare',
  'Acne',
  'SkincareAddictionIndia',
];

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  ups: number;
  num_comments: number;
  permalink: string;
  created_utc: number;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

// Rate limiter
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  
  return fetch(url, {
    headers: {
      'User-Agent': userAgent,
    },
  });
}

async function scrapeSubreddit(
  subreddit: string, 
  sort: 'hot' | 'top' | 'new' = 'hot',
  limit: number = 25
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch r/${subreddit}: ${response.status}`);
      return [];
    }
    
    const data: RedditResponse = await response.json();
    return data.data.children.map(child => child.data);
  } catch (error) {
    console.error(`Error scraping r/${subreddit}:`, error);
    return [];
  }
}

async function analyzePostWithClaude(post: RedditPost): Promise<{
  sentiment: number;
  keywords: string[];
  productsMentioned: string[];
  ingredientsMentioned: string[];
  intentType: IRedditInsight['intentType'];
}> {
  const prompt = `Analyze this Reddit skincare post and extract:
1. Sentiment score (0-1, where 0 is very negative, 0.5 is neutral, 1 is very positive)
2. Up to 5 main keywords
3. Products mentioned (brand + product name)
4. Ingredients mentioned
5. Intent type: problem, review, ingredient_confusion, routine_help, viral_product, or fail_story

Post Title: ${post.title}
Post Body: ${post.selftext || '(no body text)'}

Respond ONLY with valid JSON in this exact format:
{
  "sentiment": 0.7,
  "keywords": ["keyword1", "keyword2"],
  "productsMentioned": ["Brand ProductName"],
  "ingredientsMentioned": ["ingredient1"],
  "intentType": "problem"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const text = content.text.trim();
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    }
    
    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('Error analyzing post with Claude:', error);
    // Return default values on error
    return {
      sentiment: 0.5,
      keywords: [],
      productsMentioned: [],
      ingredientsMentioned: [],
      intentType: 'problem',
    };
  }
}

export async function scrapeRedditInsights(
  subreddits: string[] = SKINCARE_SUBREDDITS,
  sort: 'hot' | 'top' | 'new' = 'hot',
  limit: number = 25
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    await connectToDatabase();
    
    let totalProcessed = 0;
    
    for (const subreddit of subreddits) {
      console.log(`Scraping r/${subreddit}...`);
      
      const posts = await scrapeSubreddit(subreddit, sort, limit);
      
      for (const post of posts) {
        // Check if we already have this post
        const existing = await RedditInsight.findOne({ postId: post.id });
        if (existing) {
          continue;
        }
        
        // Analyze with Claude (with rate limiting built in)
        await new Promise(resolve => setTimeout(resolve, 1000)); // Extra delay for Claude
        const analysis = await analyzePostWithClaude(post);
        
        // Save to database
        await RedditInsight.create({
          postId: post.id,
          subreddit: post.subreddit,
          title: post.title,
          body: post.selftext || '',
          upvotes: post.ups,
          comments: post.num_comments,
          sentiment: analysis.sentiment,
          keywords: analysis.keywords,
          productsMentioned: analysis.productsMentioned,
          ingredientsMentioned: analysis.ingredientsMentioned,
          intentType: analysis.intentType,
          permalink: post.permalink,
          timestamp: new Date(post.created_utc * 1000),
          processedAt: new Date(),
        });
        
        totalProcessed++;
      }
      
      // Delay between subreddits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return { success: true, count: totalProcessed };
  } catch (error) {
    console.error('Error in scrapeRedditInsights:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getRedditInsights(filters?: {
  subreddit?: string;
  intentType?: string;
  minSentiment?: number;
  limit?: number;
}): Promise<IRedditInsight[]> {
  try {
    await connectToDatabase();
    
    const query: any = {};
    
    if (filters?.subreddit) {
      query.subreddit = filters.subreddit;
    }
    
    if (filters?.intentType) {
      query.intentType = filters.intentType;
    }
    
    if (filters?.minSentiment !== undefined) {
      query.sentiment = { $gte: filters.minSentiment };
    }
    
    const insights = await RedditInsight.find(query)
      .sort({ timestamp: -1 })
      .limit(filters?.limit || 100)
      .lean();
    
    return insights as unknown as IRedditInsight[];
  } catch (error) {
    console.error('Error getting Reddit insights:', error);
    return [];
  }
}

export async function getTopRedditKeywords(limit: number = 20): Promise<{ keyword: string; count: number }[]> {
  try {
    await connectToDatabase();
    
    const insights = await RedditInsight.find()
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();
    
    const keywordCounts: Record<string, number> = {};
    
    insights.forEach((insight: any) => {
      insight.keywords?.forEach((keyword: string) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });
    
    return Object.entries(keywordCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top Reddit keywords:', error);
    return [];
  }
}
