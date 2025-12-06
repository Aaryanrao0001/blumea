import { NextRequest, NextResponse } from 'next/server';
import { getTopPerformers, getBottomPerformers } from '@/lib/db/repositories/postPerformance';
import { getCurrentConfig, createNewVersion } from '@/lib/db/repositories/strategyConfig';
import { connectToDatabase } from '@/lib/db/mongoose';
import Post from '@/lib/db/models/Post';
import Category from '@/lib/db/models/Category';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret');
    if (!CRON_SECRET || cronSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current config
    const currentConfig = await getCurrentConfig();
    if (!currentConfig) {
      return NextResponse.json({
        success: false,
        message: 'No strategy config found. Create one first.',
      }, { status: 400 });
    }

    // Get top 10% and bottom 10% performers
    const topPerformers = await getTopPerformers(20);
    const bottomPerformers = await getBottomPerformers(20);

    if (topPerformers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Not enough performance data to update strategy',
        configCreated: false,
      });
    }

    // Analyze patterns
    await connectToDatabase();
    
    // Get posts with their categories
    const topPostIds = topPerformers.map(p => p.postId);
    const topPosts = await Post.find({ _id: { $in: topPostIds } })
      .populate('category')
      .lean();

    const bottomPostIds = bottomPerformers.map(p => p.postId);
    const bottomPosts = await Post.find({ _id: { $in: bottomPostIds } })
      .populate('category')
      .lean();

    // Count category frequencies
    const topCategories: { [key: string]: number } = {};
    const bottomCategories: { [key: string]: number } = {};

    topPosts.forEach(post => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catSlug = (post.category as any)?.slug || 'unknown';
      topCategories[catSlug] = (topCategories[catSlug] || 0) + 1;
    });

    bottomPosts.forEach(post => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const catSlug = (post.category as any)?.slug || 'unknown';
      bottomCategories[catSlug] = (bottomCategories[catSlug] || 0) + 1;
    });

    // Analyze score patterns
    const avgTopEngagement = topPerformers.reduce((sum, p) => sum + p.engagementScore, 0) / topPerformers.length;
    const avgTopSeo = topPerformers.reduce((sum, p) => sum + p.seoScore, 0) / topPerformers.length;
    const avgTopMonetization = topPerformers.reduce((sum, p) => sum + p.monetizationScore, 0) / topPerformers.length;

    // Adjust weights based on which scores matter most for success
    const totalScore = avgTopEngagement + avgTopSeo + avgTopMonetization;
    const newWeights = {
      engagement: parseFloat((avgTopEngagement / totalScore).toFixed(2)),
      seo: parseFloat((avgTopSeo / totalScore).toFixed(2)),
      monetization: parseFloat((avgTopMonetization / totalScore).toFixed(2)),
    };

    // Adjust topic preferences based on category performance
    const newTopicPreferences = { ...currentConfig.topicPreferences };
    
    // Boost weights for categories that perform well
    Object.keys(topCategories).forEach(catSlug => {
      const topFreq = topCategories[catSlug] || 0;
      const bottomFreq = bottomCategories[catSlug] || 0;
      const performanceRatio = topFreq / (bottomFreq + 1); // +1 to avoid division by zero
      
      // Map category slugs to topic preference keys (simplified mapping)
      const prefKey = catSlug.replace(/-/g, '') + 'Weight';
      if (newTopicPreferences[prefKey] !== undefined) {
        // Adjust weight based on performance ratio
        newTopicPreferences[prefKey] = Math.min(
          Math.max(performanceRatio * 0.5, 0.5),
          2.0
        );
      }
    });

    // Analyze word count patterns
    const topWordCounts = topPosts.map(p => p.body.split(/\s+/).length);
    const avgTopWordCount = topWordCounts.reduce((sum, wc) => sum + wc, 0) / topWordCounts.length;
    
    // Adjust intro max words (typically 10% of average top performer word count)
    const newIntroMaxWords = Math.round(Math.min(avgTopWordCount * 0.1, 200));

    // Create new config version
    const newConfig = await createNewVersion({
      weights: newWeights,
      topicPreferences: newTopicPreferences,
      contentRules: {
        ...currentConfig.contentRules,
        introMaxWords: newIntroMaxWords,
      },
      autoPublishEnabled: currentConfig.autoPublishEnabled,
      minSuccessScoreForRefresh: currentConfig.minSuccessScoreForRefresh,
      maxPostsPerDay: currentConfig.maxPostsPerDay,
    });

    return NextResponse.json({
      success: true,
      message: `Strategy updated to version ${newConfig.version}`,
      newConfig,
      insights: {
        topCategoryPatterns: topCategories,
        bottomCategoryPatterns: bottomCategories,
        averageTopScores: {
          engagement: Math.round(avgTopEngagement),
          seo: Math.round(avgTopSeo),
          monetization: Math.round(avgTopMonetization),
        },
        avgTopWordCount: Math.round(avgTopWordCount),
      },
    });
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
