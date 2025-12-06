import { NextRequest, NextResponse } from 'next/server';
import { getCurrentConfig, ensureDefaultConfig, createNewVersion } from '@/lib/db/repositories/strategyConfig';

export async function GET() {
  try {
    const config = await getCurrentConfig() || await ensureDefaultConfig();
    
    return NextResponse.json({
      success: true,
      config: {
        _id: config._id.toString(),
        version: config.version,
        weights: config.weights,
        topicPreferences: config.topicPreferences,
        contentRules: config.contentRules,
        autoPublishEnabled: config.autoPublishEnabled,
        minSuccessScoreForRefresh: config.minSuccessScoreForRefresh,
        maxPostsPerDay: config.maxPostsPerDay,
      }
    });
  } catch (error) {
    console.error('Error fetching strategy config:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new version with updated config
    const newConfig = await createNewVersion({
      weights: body.weights,
      topicPreferences: body.topicPreferences,
      contentRules: body.contentRules,
      autoPublishEnabled: body.autoPublishEnabled,
      minSuccessScoreForRefresh: body.minSuccessScoreForRefresh,
      maxPostsPerDay: body.maxPostsPerDay,
    });

    return NextResponse.json({
      success: true,
      newVersion: newConfig.version,
      config: {
        _id: newConfig._id.toString(),
        version: newConfig.version,
        weights: newConfig.weights,
        topicPreferences: newConfig.topicPreferences,
        contentRules: newConfig.contentRules,
        autoPublishEnabled: newConfig.autoPublishEnabled,
        minSuccessScoreForRefresh: newConfig.minSuccessScoreForRefresh,
        maxPostsPerDay: newConfig.maxPostsPerDay,
      }
    });
  } catch (error) {
    console.error('Error saving strategy config:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
