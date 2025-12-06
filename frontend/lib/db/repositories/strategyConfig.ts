import { connectToDatabase } from '../mongoose';
import StrategyConfigModel from '../models/StrategyConfig';
import { StrategyConfig } from '@/lib/types';

export async function getStrategyConfig(): Promise<StrategyConfig | null> {
  await connectToDatabase();
  
  // There should only be one strategy config
  const config = await StrategyConfigModel.findOne().lean();
  return config as StrategyConfig | null;
}

export async function createStrategyConfig(data: Omit<StrategyConfig, '_id'>): Promise<StrategyConfig> {
  await connectToDatabase();
  const config = await StrategyConfigModel.create(data);
  return config.toObject() as StrategyConfig;
}

export async function updateStrategyConfig(data: Partial<Omit<StrategyConfig, '_id'>>): Promise<StrategyConfig | null> {
  await connectToDatabase();
  
  const config = await StrategyConfigModel.findOneAndUpdate(
    {},
    { ...data, updatedAt: new Date() },
    { new: true, upsert: true }
  ).lean();
  
  return config as StrategyConfig | null;
}

export async function getOrCreateStrategyConfig(): Promise<StrategyConfig> {
  await connectToDatabase();
  
  let config = await StrategyConfigModel.findOne().lean();
  
  if (!config) {
    // Create default config
    const defaultConfig = {
      weights: {
        engagement: 0.33,
        seo: 0.33,
        monetization: 0.34,
      },
      topicPreferences: [],
      contentRules: {
        introMaxWords: 150,
        faqCount: 5,
        useComparisonTable: true,
        comparisonTableProbability: 0.7,
      },
      autoPublishEnabled: false,
      maxPostsPerDay: 3,
      minSuccessScoreForRefresh: 50,
      updatedAt: new Date(),
    };
    
    await StrategyConfigModel.create(defaultConfig);
    config = await StrategyConfigModel.findOne().lean();
  }
  
  return config as StrategyConfig;
}
