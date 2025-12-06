'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StrategyConfig {
  _id: string;
  version: number;
  weights: {
    engagement: number;
    seo: number;
    monetization: number;
  };
  topicPreferences: {
    [key: string]: number;
  };
  contentRules: {
    introMaxWords: number;
    includeComparisonTableProbability: number;
    includeRoutineSectionProbability: number;
    faqCount: number;
  };
  autoPublishEnabled: boolean;
  minSuccessScoreForRefresh: number;
  maxPostsPerDay: number;
}

export default function StrategyPage() {
  const [config, setConfig] = useState<StrategyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/strategy');
      const data = await res.json();
      setConfig(data.config);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/admin/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      
      if (data.success) {
        setSaveMessage('Strategy saved successfully! New version: ' + data.newVersion);
        setConfig(data.config);
      } else {
        setSaveMessage('Error: ' + data.message);
      }
    } catch (error) {
      setSaveMessage('Error saving strategy: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const updateWeight = (key: keyof StrategyConfig['weights'], value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      weights: { ...config.weights, [key]: value }
    });
  };

  const updateTopicPref = (key: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      topicPreferences: { ...config.topicPreferences, [key]: value }
    });
  };

  const updateContentRule = (key: keyof StrategyConfig['contentRules'], value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      contentRules: { ...config.contentRules, [key]: value }
    });
  };

  if (loading) {
    return <div className="text-text-secondary">Loading strategy config...</div>;
  }

  if (!config) {
    return (
      <div className="text-text-secondary">
        No strategy config found. Initialize one first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">Strategy Configuration</h1>
          <p className="text-text-secondary mt-1">Version {config.version}</p>
        </div>
        <Link
          href="/admin"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {saveMessage && (
        <div className={`p-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
          {saveMessage}
        </div>
      )}

      {/* Scoring Weights */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Scoring Weights</h2>
        <p className="text-sm text-text-secondary mb-6">
          Adjust how different metrics contribute to the overall success score (must sum to 1.0)
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-primary mb-2">
              Engagement Weight: {config.weights.engagement.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.weights.engagement}
              onChange={(e) => updateWeight('engagement', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              SEO Weight: {config.weights.seo.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.weights.seo}
              onChange={(e) => updateWeight('seo', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              Monetization Weight: {config.weights.monetization.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.weights.monetization}
              onChange={(e) => updateWeight('monetization', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="text-sm text-text-secondary">
            Total: {(config.weights.engagement + config.weights.seo + config.weights.monetization).toFixed(2)}
            {Math.abs(config.weights.engagement + config.weights.seo + config.weights.monetization - 1.0) > 0.01 && (
              <span className="text-yellow-400 ml-2">⚠ Should sum to 1.0</span>
            )}
          </div>
        </div>
      </div>

      {/* Topic Preferences */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Topic Preferences</h2>
        <p className="text-sm text-text-secondary mb-6">
          Weight different topic categories (higher = more preference)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config.topicPreferences).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm text-text-primary mb-2">
                {key.replace('Weight', '').replace(/([A-Z])/g, ' $1').trim()}: {value.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={value}
                onChange={(e) => updateTopicPref(key, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content Rules */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Content Rules</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-primary mb-2">
              Intro Max Words: {config.contentRules.introMaxWords}
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={config.contentRules.introMaxWords}
              onChange={(e) => updateContentRule('introMaxWords', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              Comparison Table Probability: {(config.contentRules.includeComparisonTableProbability * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.contentRules.includeComparisonTableProbability}
              onChange={(e) => updateContentRule('includeComparisonTableProbability', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              Routine Section Probability: {(config.contentRules.includeRoutineSectionProbability * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.contentRules.includeRoutineSectionProbability}
              onChange={(e) => updateContentRule('includeRoutineSectionProbability', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              FAQ Count: {config.contentRules.faqCount}
            </label>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={config.contentRules.faqCount}
              onChange={(e) => updateContentRule('faqCount', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Auto-Publish & Other Settings */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Publishing & Refresh Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoPublish"
              checked={config.autoPublishEnabled}
              onChange={(e) => setConfig({ ...config, autoPublishEnabled: e.target.checked })}
              className="mr-3"
            />
            <label htmlFor="autoPublish" className="text-text-primary">
              Enable Auto-Publish (publish drafts automatically)
            </label>
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              Min Success Score for Refresh: {config.minSuccessScoreForRefresh}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.minSuccessScoreForRefresh}
              onChange={(e) => setConfig({ ...config, minSuccessScoreForRefresh: parseInt(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-text-secondary mt-1">
              Posts below this score will be considered for content refresh
            </p>
          </div>

          <div>
            <label className="block text-sm text-text-primary mb-2">
              Max Posts Per Day: {config.maxPostsPerDay}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={config.maxPostsPerDay}
              onChange={(e) => setConfig({ ...config, maxPostsPerDay: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-bg-primary px-6 py-3 rounded-md font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration (New Version)'}
        </button>
      </div>
    </div>
  );
}
