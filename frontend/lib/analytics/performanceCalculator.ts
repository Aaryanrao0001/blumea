import { IPostMetrics, IPostRevenue, IStrategyConfig } from '@/lib/types';

/**
 * Calculate engagement score based on metrics
 * Score is 0-100 based on time on page, bounce rate, and scroll depth
 */
export function calculateEngagementScore(metrics: IPostMetrics): number {
  // Time on page: ideal > 180 seconds (3 minutes)
  const timeScore = Math.min((metrics.avgTimeOnPage / 180) * 100, 100);
  
  // Bounce rate: lower is better (inverted)
  const bounceScore = (1 - metrics.bounceRate) * 100;
  
  // Scroll depth: ideal is 100%
  const scrollScore = metrics.scrollDepthAvg * 100;
  
  // Weighted average
  const score = (timeScore * 0.35) + (bounceScore * 0.35) + (scrollScore * 0.30);
  
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Calculate SEO score based on search metrics
 * Score is 0-100 based on impressions, clicks, CTR, and position
 */
export function calculateSeoScore(metrics: IPostMetrics): number {
  if (!metrics.searchImpressions || !metrics.searchClicks || !metrics.avgPosition) {
    return 0;
  }
  
  // Impressions: ideal > 1000/day
  const impressionScore = Math.min((metrics.searchImpressions / 1000) * 100, 100);
  
  // Clicks: ideal > 50/day
  const clickScore = Math.min((metrics.searchClicks / 50) * 100, 100);
  
  // CTR: ideal > 5%
  const ctrScore = Math.min(((metrics.searchCtr || 0) / 0.05) * 100, 100);
  
  // Position: ideal < 5 (inverted scale)
  const positionScore = Math.max(0, 100 - (metrics.avgPosition * 10));
  
  // Weighted average
  const score = (impressionScore * 0.25) + (clickScore * 0.25) + (ctrScore * 0.25) + (positionScore * 0.25);
  
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Calculate monetization score based on revenue metrics
 * Score is 0-100 based on clicks, conversions, revenue, and EPC
 */
export function calculateMonetizationScore(revenue: IPostRevenue): number {
  // Clicks: ideal > 20/day
  const clickScore = Math.min((revenue.affiliateClicks / 20) * 100, 100);
  
  // Conversion rate: ideal > 5%
  const conversionRate = revenue.affiliateClicks > 0 
    ? revenue.affiliateConversions / revenue.affiliateClicks 
    : 0;
  const conversionScore = Math.min((conversionRate / 0.05) * 100, 100);
  
  // Revenue: ideal > $10/day
  const revenueScore = Math.min((revenue.revenue / 10) * 100, 100);
  
  // EPC (Earnings Per Click): ideal > $0.50
  const epcScore = Math.min((revenue.epc / 0.50) * 100, 100);
  
  // Weighted average
  const score = (clickScore * 0.2) + (conversionScore * 0.3) + (revenueScore * 0.3) + (epcScore * 0.2);
  
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Calculate overall success score using strategy config weights
 */
export function calculateSuccessScore(
  engagementScore: number,
  seoScore: number,
  monetizationScore: number,
  config: IStrategyConfig
): number {
  const score = 
    (engagementScore * config.weights.engagement) +
    (seoScore * config.weights.seo) +
    (monetizationScore * config.weights.monetization);
  
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Aggregate metrics over a date range
 */
export function aggregateMetrics(metrics: IPostMetrics[]): IPostMetrics | null {
  if (metrics.length === 0) return null;
  
  const totalPageViews = metrics.reduce((sum, m) => sum + m.pageViews, 0);
  const totalUniqueVisitors = metrics.reduce((sum, m) => sum + m.uniqueVisitors, 0);
  const avgTimeOnPage = metrics.reduce((sum, m) => sum + m.avgTimeOnPage, 0) / metrics.length;
  const avgBounceRate = metrics.reduce((sum, m) => sum + m.bounceRate, 0) / metrics.length;
  const avgScrollDepth = metrics.reduce((sum, m) => sum + m.scrollDepthAvg, 0) / metrics.length;
  
  const metricsWithSearch = metrics.filter(m => m.searchImpressions !== undefined);
  const totalSearchImpressions = metricsWithSearch.reduce((sum, m) => sum + (m.searchImpressions || 0), 0);
  const totalSearchClicks = metricsWithSearch.reduce((sum, m) => sum + (m.searchClicks || 0), 0);
  const avgPosition = metricsWithSearch.length > 0
    ? metricsWithSearch.reduce((sum, m) => sum + (m.avgPosition || 0), 0) / metricsWithSearch.length
    : undefined;
  
  return {
    _id: metrics[0]._id,
    postId: metrics[0].postId,
    date: `${metrics[0].date} to ${metrics[metrics.length - 1].date}`,
    pageViews: totalPageViews,
    uniqueVisitors: totalUniqueVisitors,
    avgTimeOnPage,
    bounceRate: avgBounceRate,
    scrollDepthAvg: avgScrollDepth,
    searchImpressions: totalSearchImpressions,
    searchClicks: totalSearchClicks,
    searchCtr: totalSearchImpressions > 0 ? totalSearchClicks / totalSearchImpressions : 0,
    avgPosition,
    createdAt: metrics[0].createdAt,
    updatedAt: metrics[0].updatedAt,
  };
}

/**
 * Aggregate revenue over a date range
 */
export function aggregateRevenue(revenues: IPostRevenue[]): IPostRevenue | null {
  if (revenues.length === 0) return null;
  
  const totalClicks = revenues.reduce((sum, r) => sum + r.affiliateClicks, 0);
  const totalConversions = revenues.reduce((sum, r) => sum + r.affiliateConversions, 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + r.revenue, 0);
  const avgEpc = totalClicks > 0 ? totalRevenue / totalClicks : 0;
  
  return {
    _id: revenues[0]._id,
    postId: revenues[0].postId,
    date: `${revenues[0].date} to ${revenues[revenues.length - 1].date}`,
    affiliateClicks: totalClicks,
    affiliateConversions: totalConversions,
    revenue: totalRevenue,
    epc: avgEpc,
    createdAt: revenues[0].createdAt,
    updatedAt: revenues[0].updatedAt,
  };
}
