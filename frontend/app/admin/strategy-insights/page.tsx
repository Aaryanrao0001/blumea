'use client';

import { useState, useEffect } from 'react';

interface StrategyInsights {
  summary: string;
  recommendations: string[];
  recommendedWeights: { engagement: number; seo: number; monetization: number } | null;
  contentRuleAdjustments: any;
  weeklyFocus: string;
}

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
  updatedAt: string;
}

export default function StrategyInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<StrategyInsights | null>(null);
  const [config, setConfig] = useState<StrategyConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/jobs/weekly-strategy-eval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.success) {
        setInsights(data.insights);
        setConfig(data.updatedConfig);
      } else {
        setError(data.message || 'Failed to run evaluation');
      }
    } catch (err) {
      setError('Failed to run evaluation: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-accent mb-2">
          Strategy Insights
        </h1>
        <p className="text-text-secondary">
          AI-powered weekly content strategy evaluation and recommendations
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runEvaluation}
          disabled={loading}
          className="bg-accent text-bg-primary px-6 py-3 rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running Evaluation...' : 'Run Weekly Evaluation'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {insights && config && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-bg-secondary rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-accent mb-3">
              Summary
            </h2>
            <p className="text-text-secondary">{insights.summary}</p>
          </div>

          {/* Weekly Focus */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-accent mb-3">
              Weekly Focus
            </h2>
            <p className="text-text-primary font-medium">{insights.weeklyFocus}</p>
          </div>

          {/* Recommendations */}
          <div className="bg-bg-secondary rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-accent mb-4">
              Recommendations
            </h2>
            <ul className="space-y-2">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-accent mt-1">•</span>
                  <span className="text-text-secondary">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current vs Recommended Weights */}
          <div className="bg-bg-secondary rounded-lg p-6">
            <h2 className="text-xl font-heading font-semibold text-accent mb-4">
              Strategy Weights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-tertiary rounded-lg p-4">
                <h3 className="text-sm text-text-tertiary mb-2">Engagement</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-text-primary">
                    {(config.weights.engagement * 100).toFixed(0)}%
                  </p>
                  {insights.recommendedWeights && (
                    <p className="text-sm text-text-secondary">
                      Recommended: {(insights.recommendedWeights.engagement * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-bg-tertiary rounded-lg p-4">
                <h3 className="text-sm text-text-tertiary mb-2">SEO</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-text-primary">
                    {(config.weights.seo * 100).toFixed(0)}%
                  </p>
                  {insights.recommendedWeights && (
                    <p className="text-sm text-text-secondary">
                      Recommended: {(insights.recommendedWeights.seo * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-bg-tertiary rounded-lg p-4">
                <h3 className="text-sm text-text-tertiary mb-2">Monetization</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-text-primary">
                    {(config.weights.monetization * 100).toFixed(0)}%
                  </p>
                  {insights.recommendedWeights && (
                    <p className="text-sm text-text-secondary">
                      Recommended: {(insights.recommendedWeights.monetization * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Rules */}
          {insights.contentRuleAdjustments && (
            <div className="bg-bg-secondary rounded-lg p-6">
              <h2 className="text-xl font-heading font-semibold text-accent mb-4">
                Content Rule Adjustments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(insights.contentRuleAdjustments).map(([key, value]) => (
                  <div key={key} className="bg-bg-tertiary rounded-lg p-4">
                    <h3 className="text-sm text-text-tertiary mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-lg font-semibold text-text-primary">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-sm text-text-tertiary text-right">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </div>
        </div>
      )}

      {!insights && !loading && (
        <div className="bg-bg-secondary rounded-lg p-12 text-center">
          <p className="text-text-secondary mb-2">
            No evaluation data available yet.
          </p>
          <p className="text-text-tertiary text-sm">
            Click the button above to run your first weekly strategy evaluation.
          </p>
        </div>
      )}
    </div>
  );
}
