import { NextRequest, NextResponse } from 'next/server';
import { upsertMetrics } from '@/lib/db/repositories/postMetrics';
import { upsertRevenue } from '@/lib/db/repositories/postRevenue';
import { getAllPostsPhase3 } from '@/lib/db/repositories/posts';
import { fetchPageMetrics, fetchChannelBreakdown, fetchDeviceGeoData } from '@/lib/analytics/ga4Client';
import { fetchSearchPerformance } from '@/lib/analytics/searchConsoleClient';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date range (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = startDate;

    // Fetch published posts
    const { posts } = await getAllPostsPhase3({ status: 'published', limit: 100 });

    const results = {
      metricsImported: 0,
      revenueImported: 0,
      errors: [] as string[],
    };

    if (posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No published posts to process',
        results,
      });
    }

    // Get page paths for GA4 and Search Console
    const pagePaths = posts.map(p => `/blog/${p.slug}`);

    // Fetch GA4 data
    const [pageMetrics, channelData, deviceGeoData] = await Promise.all([
      fetchPageMetrics(startDate, endDate, pagePaths),
      fetchChannelBreakdown(startDate, endDate),
      fetchDeviceGeoData(startDate, endDate, pagePaths),
    ]);

    // Fetch Search Console data
    const searchData = await fetchSearchPerformance(
      startDate,
      endDate,
      pagePaths.map(p => `${process.env.NEXT_PUBLIC_SITE_URL}${p}`)
    );

    // Process each post
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const pagePath = pagePaths[i];

      try {
        const pageMetric = pageMetrics.find(m => m.pagePath === pagePath);
        const deviceGeo = deviceGeoData.find(d => d.pagePath === pagePath);
        const search = searchData.find(s => s.url.includes(post.slug));

        if (pageMetric) {
          // Upsert metrics with enhanced data
          await upsertMetrics({
            postId: post._id,
            date: yesterday,
            pageViews: pageMetric.pageViews,
            uniqueVisitors: pageMetric.uniqueVisitors,
            sessions: pageMetric.sessions,
            avgEngagedTime: pageMetric.avgEngagedTime,
            bounceRate: pageMetric.bounceRate,
            scrollDepthAvg: pageMetric.scrollDepthAvg,
            scrollDepthP75: pageMetric.scrollDepthP75,
            exitsFromPage: pageMetric.exitsFromPage,
            mobileShare: deviceGeo?.mobileShare,
            desktopShare: deviceGeo?.desktopShare,
            topCountries: deviceGeo?.topCountries,
            byChannel: channelData,
            searchImpressions: search?.impressions,
            searchClicks: search?.clicks,
            searchCtr: search?.ctr,
            avgPosition: search?.position,
          });
          results.metricsImported++;
        }

        // TODO: Fetch actual affiliate revenue data
        await upsertRevenue({
          postId: post._id,
          date: yesterday,
          affiliateClicks: 0,
          conversions: 0,
          revenue: 0,
          epc: 0,
        });
        results.revenueImported++;
      } catch (error) {
        results.errors.push(`Error processing post ${post._id}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics import job completed',
      results,
      note: 'Using mock data until GA4 and Search Console credentials are configured',
    });
  } catch (error) {
    console.error('Error in fetch-analytics job:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
