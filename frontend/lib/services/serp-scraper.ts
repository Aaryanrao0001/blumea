import { connectToDatabase } from '../db/mongoose';
import SerpInsight from '../db/models/SerpInsight';
import { ISerpInsight } from '../types/intelligence';

// User agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

// Rate limiter
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests

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
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });
}

export async function scrapeSerpData(keyword: string): Promise<{
  success: boolean;
  insight?: ISerpInsight;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    // Note: Actual SERP scraping is complex and may violate Google's ToS
    // This is a simplified mock implementation
    // In production, consider using services like ScraperAPI, ValueSERP, etc.
    
    const searchResults = await mockScrapeSearchResults(keyword);
    const peopleAlsoAsk = await mockScrapePAA(keyword);
    const relatedSearches = await mockScrapeRelatedSearches(keyword);
    const autocomplete = await mockScrapeAutocomplete(keyword);
    
    const insightData = {
      keyword,
      searchResults,
      peopleAlsoAsk,
      relatedSearches,
      autocomplete,
      lastScraped: new Date(),
    };
    
    // Upsert the insight
    const insight = await SerpInsight.findOneAndUpdate(
      { keyword },
      insightData,
      { upsert: true, new: true }
    ).lean();
    
    return { success: true, insight: insight as unknown as ISerpInsight };
  } catch (error) {
    console.error('Error scraping SERP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getSerpInsights(keyword?: string, limit: number = 100): Promise<ISerpInsight[]> {
  try {
    await connectToDatabase();
    
    const query = keyword ? { keyword: new RegExp(keyword, 'i') } : {};
    
    const insights = await SerpInsight.find(query)
      .sort({ lastScraped: -1 })
      .limit(limit)
      .lean();
    
    return insights as unknown as ISerpInsight[];
  } catch (error) {
    console.error('Error getting SERP insights:', error);
    return [];
  }
}

export async function getPAAQuestions(keyword: string): Promise<string[]> {
  try {
    await connectToDatabase();
    
    const insight = await SerpInsight.findOne({ keyword }).lean();
    
    if (!insight) {
      return [];
    }
    
    return insight.peopleAlsoAsk.map((paa: any) => paa.question);
  } catch (error) {
    console.error('Error getting PAA questions:', error);
    return [];
  }
}

// Mock scraping functions (replace with actual scraping in production)
async function mockScrapeSearchResults(keyword: string) {
  // This would normally parse HTML from Google search results
  // For now, return mock data
  const domains = [
    'healthline.com',
    'byrdie.com',
    'dermstore.com',
    'skincare.com',
    'reddit.com',
    'beautypedia.com',
    'paulaschoice.com',
    'cerave.com',
    'theordinary.com',
    'sephora.com',
  ];
  
  return domains.slice(0, 10).map((domain, index) => ({
    position: index + 1,
    url: `https://${domain}/article/${keyword.replace(/\s+/g, '-')}`,
    title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Complete Guide | ${domain}`,
    description: `Learn everything about ${keyword} including benefits, how to use, and best products. Expert-reviewed skincare advice.`,
    domain,
  }));
}

async function mockScrapePAA(keyword: string) {
  // People Also Ask questions
  const paaTemplates = [
    `What is ${keyword}?`,
    `How does ${keyword} work?`,
    `Is ${keyword} good for sensitive skin?`,
    `When should I use ${keyword}?`,
    `Can I use ${keyword} every day?`,
    `What are the benefits of ${keyword}?`,
    `Are there any side effects of ${keyword}?`,
    `How long does ${keyword} take to work?`,
  ];
  
  return paaTemplates.slice(0, 4).map(question => ({
    question,
    snippet: `${question} - ${keyword} is a popular skincare ingredient that...`,
  }));
}

async function mockScrapeRelatedSearches(keyword: string) {
  // Related searches at bottom of Google
  return [
    `${keyword} benefits`,
    `${keyword} side effects`,
    `${keyword} vs alternatives`,
    `best ${keyword} products`,
    `${keyword} routine`,
    `${keyword} for beginners`,
    `${keyword} reviews`,
    `how to use ${keyword}`,
  ];
}

async function mockScrapeAutocomplete(keyword: string) {
  // Google autocomplete suggestions
  return [
    `${keyword} routine`,
    `${keyword} products`,
    `${keyword} for oily skin`,
    `${keyword} for dry skin`,
    `${keyword} benefits`,
    `${keyword} before and after`,
    `${keyword} ingredients`,
    `${keyword} reddit`,
  ];
}
