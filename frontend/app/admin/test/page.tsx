'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  message: string;
  collections?: string[];
}

export default function SystemTestPage() {
  const [mongoResult, setMongoResult] = useState<TestResult | null>(null);
  const [claudeResult, setClaudeResult] = useState<TestResult | null>(null);
  const [mongoLoading, setMongoLoading] = useState(false);
  const [claudeLoading, setClaudeLoading] = useState(false);

  const testMongoDB = async () => {
    setMongoLoading(true);
    try {
      const res = await fetch('/api/db/test');
      const data = await res.json();
      setMongoResult(data);
    } catch (error) {
      setMongoResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    } finally {
      setMongoLoading(false);
    }
  };

  const testClaude = async () => {
    setClaudeLoading(true);
    try {
      const res = await fetch('/api/ai/test');
      const data = await res.json();
      setClaudeResult(data);
    } catch (error) {
      setClaudeResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      });
    } finally {
      setClaudeLoading(false);
    }
  };

  useEffect(() => {
    testMongoDB();
    testClaude();
  }, []);

  const StatusIcon = ({ success }: { success: boolean | null }) => {
    if (success === null) return <span className="text-text-tertiary">⏳</span>;
    return success ? (
      <span className="text-green-400 text-2xl">✓</span>
    ) : (
      <span className="text-red-400 text-2xl">✗</span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-text-primary">System Test</h1>
      <p className="text-text-secondary">
        Verify that all integrations are working correctly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MongoDB Test */}
        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">MongoDB</h2>
            <StatusIcon success={mongoResult?.success ?? null} />
          </div>

          <div className="mb-4">
            <div
              className={`p-4 rounded-md ${
                mongoResult?.success
                  ? 'bg-green-900/20 text-green-400'
                  : mongoResult?.success === false
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-bg-tertiary text-text-tertiary'
              }`}
            >
              {mongoLoading ? (
                'Testing connection...'
              ) : mongoResult ? (
                mongoResult.message
              ) : (
                'Not tested yet'
              )}
            </div>
          </div>

          {mongoResult?.collections && mongoResult.collections.length > 0 && (
            <div className="mb-4">
              <h3 className="text-text-secondary text-sm mb-2">Collections:</h3>
              <div className="flex flex-wrap gap-2">
                {mongoResult.collections.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-1 bg-bg-tertiary rounded text-text-tertiary text-xs"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={testMongoDB}
            disabled={mongoLoading}
            className="w-full bg-bg-tertiary text-text-secondary py-2 rounded hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {mongoLoading ? 'Testing...' : 'Retest Connection'}
          </button>
        </div>

        {/* Claude API Test */}
        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Claude API</h2>
            <StatusIcon success={claudeResult?.success ?? null} />
          </div>

          <div className="mb-4">
            <div
              className={`p-4 rounded-md ${
                claudeResult?.success
                  ? 'bg-green-900/20 text-green-400'
                  : claudeResult?.success === false
                  ? 'bg-red-900/20 text-red-400'
                  : 'bg-bg-tertiary text-text-tertiary'
              }`}
            >
              {claudeLoading ? (
                'Testing connection...'
              ) : claudeResult ? (
                claudeResult.message
              ) : (
                'Not tested yet'
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-text-secondary text-sm mb-2">Model:</h3>
            <span className="px-2 py-1 bg-bg-tertiary rounded text-text-tertiary text-xs">
              claude-sonnet-4-20250514
            </span>
          </div>

          <button
            onClick={testClaude}
            disabled={claudeLoading}
            className="w-full bg-bg-tertiary text-text-secondary py-2 rounded hover:text-text-primary transition-colors disabled:opacity-50"
          >
            {claudeLoading ? 'Testing...' : 'Retest Connection'}
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Overall Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl mb-2">
              {mongoResult?.success && claudeResult?.success ? '🟢' : '🔴'}
            </div>
            <div className="text-text-secondary text-sm">System Status</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {mongoResult?.success ? '🟢' : mongoResult === null ? '⏳' : '🔴'}
            </div>
            <div className="text-text-secondary text-sm">Database</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">
              {claudeResult?.success ? '🟢' : claudeResult === null ? '⏳' : '🔴'}
            </div>
            <div className="text-text-secondary text-sm">AI Engine</div>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🟢</div>
            <div className="text-text-secondary text-sm">Web Server</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/api/db/test"
            target="_blank"
            className="p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors text-center"
          >
            <div className="font-medium text-text-primary">DB Test Endpoint</div>
            <div className="text-sm text-text-secondary">/api/db/test</div>
          </a>
          <a
            href="/api/ai/test"
            target="_blank"
            className="p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors text-center"
          >
            <div className="font-medium text-text-primary">AI Test Endpoint</div>
            <div className="text-sm text-text-secondary">/api/ai/test</div>
          </a>
          <a
            href="/admin"
            className="p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors text-center"
          >
            <div className="font-medium text-text-primary">Back to Dashboard</div>
            <div className="text-sm text-text-secondary">View stats & actions</div>
          </a>
        </div>
      </div>
    </div>
  );
}
