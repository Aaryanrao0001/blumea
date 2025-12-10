import { scrapeRedditInsights } from './reddit-scraper';
import { analyzeTrendsForKeyword, getRisingKeywords } from './google-trends';
import { scrapeSerpData } from './serp-scraper';
import { calculateOpportunities, getTopOpportunities } from './opportunity-calculator';

export interface CronJobResult {
  success: boolean;
  jobType: string;
  details: any;
  error?: string;
  timestamp: Date;
}

export async function runRedditScrapingJob(): Promise<CronJobResult> {
  try {
    console.log('Starting Reddit scraping job...');
    const result = await scrapeRedditInsights();
    
    return {
      success: result.success,
      jobType: 'reddit_scraping',
      details: { count: result.count },
      error: result.error,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      jobType: 'reddit_scraping',
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

export async function runTrendsUpdateJob(keywords: string[]): Promise<CronJobResult> {
  try {
    console.log('Starting Google Trends update job...');
    const results = [];
    
    for (const keyword of keywords) {
      const result = await analyzeTrendsForKeyword(keyword, '3-m');
      results.push(result);
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: true,
      jobType: 'trends_update',
      details: {
        total: keywords.length,
        successful: successCount,
        failed: keywords.length - successCount,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      jobType: 'trends_update',
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

export async function runSerpAnalysisJob(keywords: string[]): Promise<CronJobResult> {
  try {
    console.log('Starting SERP analysis job...');
    const results = [];
    
    for (const keyword of keywords) {
      const result = await scrapeSerpData(keyword);
      results.push(result);
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: true,
      jobType: 'serp_analysis',
      details: {
        total: keywords.length,
        successful: successCount,
        failed: keywords.length - successCount,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      jobType: 'serp_analysis',
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

export async function runOpportunityCalculationJob(): Promise<CronJobResult> {
  try {
    console.log('Starting opportunity calculation job...');
    const result = await calculateOpportunities();
    
    return {
      success: result.success,
      jobType: 'opportunity_calculation',
      details: { count: result.opportunities.length },
      error: result.error,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      success: false,
      jobType: 'opportunity_calculation',
      details: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

export async function runFullIntelligenceGathering(): Promise<CronJobResult[]> {
  const results: CronJobResult[] = [];
  
  // 1. Scrape Reddit
  results.push(await runRedditScrapingJob());
  
  // 2. Get rising keywords for trends analysis
  const risingKeywords = await getRisingKeywords(10);
  const trendKeywords = risingKeywords.map(k => k.keyword);
  
  if (trendKeywords.length > 0) {
    results.push(await runTrendsUpdateJob(trendKeywords));
  }
  
  // 3. Run SERP analysis on top opportunities
  const topOpportunities = await getTopOpportunities(5, 60);
  const serpKeywords = topOpportunities.map(o => o.keyword);
  
  if (serpKeywords.length > 0) {
    results.push(await runSerpAnalysisJob(serpKeywords));
  }
  
  // 4. Recalculate opportunities
  results.push(await runOpportunityCalculationJob());
  
  return results;
}
