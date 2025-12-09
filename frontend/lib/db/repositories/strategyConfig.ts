import { connectToDatabase } from '../mongoose';
import StrategyConfigModel from '../models/StrategyConfig';
import { StrategyConfig } from '@/lib/types';

export async function getStrategyConfig(): Promise<StrategyConfig | null> {
  await connectToDatabase();
  
  // There should only be one strategy config
  const config = await StrategyConfigModel.findOne().lean();
  return config as StrategyConfig | null;
}

export async function getCurrentConfig(): Promise<StrategyConfig> {
  await connectToDatabase();
  
  const config = await StrategyConfigModel.findOne().lean();
  
  if (config) {
    return config as StrategyConfig;
  }
  
  // Create default config if none exists
  return await getOrCreateStrategyConfig();
}

export async function updateConfig(data: Partial<Omit<StrategyConfig, '_id'>>): Promise<StrategyConfig | null> {
  await connectToDatabase();
  
  const config = await StrategyConfigModel.findOneAndUpdate(
    {},
    { ...data, updatedAt: new Date() },
    { new: true, upsert: true }
  ).lean();
  
  return config as StrategyConfig | null;
}

export async function createStrategyConfig(data: Omit<StrategyConfig, '_id'>): Promise<StrategyConfig> {
  await connectToDatabase();
  const config = await StrategyConfigModel.create(data);
  return config.toObject() as StrategyConfig;
}

// Alias for backward compatibility
export const updateStrategyConfig = updateConfig;

export async function getOrCreateStrategyConfig(): Promise<StrategyConfig> {
  await connectToDatabase();
  
  const config = await StrategyConfigModel.findOne().lean();
  
  if (config) {
    return config as StrategyConfig;
  }
  
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
  
  const newConfig = await StrategyConfigModel.create(defaultConfig);
  return newConfig.toObject() as StrategyConfig;
}
