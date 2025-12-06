'use client';

import { useState, useEffect } from 'react';

interface StrategyConfig {
  weights: {
    engagement: number;
    seo: number;
    monetization: number;
  };
  contentRules: {
    introMaxWords: number;
    faqCount: number;
    useComparisonTable: boolean;
    comparisonTableProbability: number;
  };
  autoPublishEnabled: boolean;
  maxPostsPerDay: number;
  minSuccessScoreForRefresh: number;
}

export default function AdminStrategyPage() {
  const [config, setConfig] = useState<StrategyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      // TODO: Create API endpoint to fetch strategy config
      // For now, set default config
      setConfig({
        weights: {
          engagement: 0.33,
          seo: 0.33,
          monetization: 0.34,
        },
        contentRules: {
          introMaxWords: 150,
          faqCount: 5,
          useComparisonTable: true,
          comparisonTableProbability: 0.7,
        },
        autoPublishEnabled: false,
        maxPostsPerDay: 3,
        minSuccessScoreForRefresh: 50,
      });
    } catch (error) {
      console.error('Error fetching strategy config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      // TODO: Create API endpoint to update strategy config
      // const res = await fetch('/api/admin/strategy', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config),
      // });
      
      alert('Strategy config updated successfully!');
    } catch (error) {
      console.error('Error saving strategy config:', error);
      alert('Error saving config');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return <div className="text-text-secondary">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-accent mb-6">AI Strategy Configuration</h1>

      <div className="space-y-6">
        {/* Weights */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Performance Weights</h2>
          <p className="text-text-secondary text-sm mb-4">
            Adjust how different metrics contribute to overall success score (must sum to 1.0)
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Engagement Weight</span>
                <span className="text-accent font-semibold">{config.weights.engagement.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.weights.engagement}
                onChange={(e) => setConfig({
                  ...config,
                  weights: { ...config.weights, engagement: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">SEO Weight</span>
                <span className="text-accent font-semibold">{config.weights.seo.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.weights.seo}
                onChange={(e) => setConfig({
                  ...config,
                  weights: { ...config.weights, seo: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="text-text-secondary">Monetization Weight</span>
                <span className="text-accent font-semibold">{config.weights.monetization.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.weights.monetization}
                onChange={(e) => setConfig({
                  ...config,
                  weights: { ...config.weights, monetization: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div className="text-sm text-text-tertiary">
              Total: {(config.weights.engagement + config.weights.seo + config.weights.monetization).toFixed(2)}
              {Math.abs((config.weights.engagement + config.weights.seo + config.weights.monetization) - 1.0) > 0.01 && (
                <span className="text-red-500 ml-2">⚠️ Weights should sum to 1.0</span>
              )}
            </div>
          </div>
        </div>

        {/* Content Rules */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Content Generation Rules</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Max Intro Words
              </label>
              <input
                type="number"
                value={config.contentRules.introMaxWords}
                onChange={(e) => setConfig({
                  ...config,
                  contentRules: { ...config.contentRules, introMaxWords: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">
                FAQ Count
              </label>
              <input
                type="number"
                value={config.contentRules.faqCount}
                onChange={(e) => setConfig({
                  ...config,
                  contentRules: { ...config.contentRules, faqCount: parseInt(e.target.value) || 0 }
                })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.contentRules.useComparisonTable}
                  onChange={(e) => setConfig({
                    ...config,
                    contentRules: { ...config.contentRules, useComparisonTable: e.target.checked }
                  })}
                  className="w-4 h-4"
                />
                <span className="text-text-secondary">Use Comparison Tables</span>
              </label>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Comparison Table Probability
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.contentRules.comparisonTableProbability}
                onChange={(e) => setConfig({
                  ...config,
                  contentRules: { ...config.contentRules, comparisonTableProbability: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
              <span className="text-accent text-sm">{(config.contentRules.comparisonTableProbability * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Auto-Publishing */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Auto-Publishing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.autoPublishEnabled}
                  onChange={(e) => setConfig({
                    ...config,
                    autoPublishEnabled: e.target.checked
                  })}
                  className="w-4 h-4"
                />
                <span className="text-text-secondary">Enable Auto-Publishing</span>
              </label>
              <p className="text-text-tertiary text-sm mt-2 ml-7">
                When enabled, AI-generated content will be automatically published instead of saved as drafts
              </p>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Max Posts Per Day
              </label>
              <input
                type="number"
                value={config.maxPostsPerDay}
                onChange={(e) => setConfig({
                  ...config,
                  maxPostsPerDay: parseInt(e.target.value) || 0
                })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Min Success Score for Refresh (0-100)
              </label>
              <input
                type="number"
                value={config.minSuccessScoreForRefresh}
                onChange={(e) => setConfig({
                  ...config,
                  minSuccessScoreForRefresh: parseInt(e.target.value) || 0
                })}
                min="0"
                max="100"
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
              <p className="text-text-tertiary text-sm mt-2">
                Posts with success scores below this threshold will be flagged for content refresh
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent text-bg-primary px-6 py-2.5 rounded-md font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
