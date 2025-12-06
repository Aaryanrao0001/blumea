import { connectToDatabase } from '../mongoose';
import StrategyConfig from '../models/StrategyConfig';
import { IStrategyConfig } from '@/lib/types';

export async function getCurrentConfig(): Promise<IStrategyConfig | null> {
  await connectToDatabase();
  const config = await StrategyConfig.findOne().sort({ version: -1 }).lean();
  return config as unknown as IStrategyConfig | null;
}

export async function createNewVersion(
  data: Omit<IStrategyConfig, '_id' | 'version' | 'createdAt' | 'updatedAt'>
): Promise<IStrategyConfig> {
  await connectToDatabase();
  
  // Get the latest version
  const latestConfig = await StrategyConfig.findOne().sort({ version: -1 });
  const newVersion = latestConfig ? latestConfig.version + 1 : 1;
  
  const config = await StrategyConfig.create({
    ...data,
    version: newVersion,
  });
  
  return config.toObject() as unknown as IStrategyConfig;
}

export async function updateConfig(
  configId: string,
  updates: Partial<Omit<IStrategyConfig, '_id' | 'version' | 'createdAt' | 'updatedAt'>>
): Promise<IStrategyConfig | null> {
  await connectToDatabase();
  const config = await StrategyConfig.findByIdAndUpdate(
    configId,
    { $set: updates },
    { new: true }
  ).lean();
  return config as unknown as IStrategyConfig | null;
}

export async function getConfigByVersion(version: number): Promise<IStrategyConfig | null> {
  await connectToDatabase();
  const config = await StrategyConfig.findOne({ version }).lean();
  return config as unknown as IStrategyConfig | null;
}

export async function getAllConfigs(): Promise<IStrategyConfig[]> {
  await connectToDatabase();
  const configs = await StrategyConfig.find().sort({ version: -1 }).lean();
  return configs as unknown as IStrategyConfig[];
}

// Create default config if none exists
export async function ensureDefaultConfig(): Promise<IStrategyConfig> {
  await connectToDatabase();
  const existing = await getCurrentConfig();
  
  if (existing) {
    return existing;
  }
  
  // Create default config
  const defaultConfig = await StrategyConfig.create({
    version: 1,
    weights: {
      engagement: 0.4,
      seo: 0.3,
      monetization: 0.3,
    },
    topicPreferences: {
      acneWeight: 1.0,
      antiAgingWeight: 1.0,
      sunscreenWeight: 1.2,
      barrierRepairWeight: 1.1,
    },
    contentRules: {
      introMaxWords: 150,
      includeComparisonTableProbability: 0.7,
      includeRoutineSectionProbability: 0.5,
      faqCount: 5,
    },
    autoPublishEnabled: false,
    minSuccessScoreForRefresh: 50,
    maxPostsPerDay: 3,
  });
  
  return defaultConfig.toObject() as unknown as IStrategyConfig;
}
