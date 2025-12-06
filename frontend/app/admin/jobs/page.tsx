'use client';

import { useState } from 'react';
import Link from 'next/link';

interface JobResult {
  jobName: string;
  status: 'running' | 'success' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());

  const runJob = async (jobName: string, endpoint: string, body?: object) => {
    setRunningJobs(prev => new Set(prev).add(jobName));
    
    setJobs(prev => [
      { jobName, status: 'running', message: 'Job started...' },
      ...prev
    ]);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': process.env.NEXT_PUBLIC_CRON_SECRET || '',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();
      
      setJobs(prev => [
        {
          jobName,
          status: data.success ? 'success' : 'error',
          message: data.message || 'Job completed',
          data,
        },
        ...prev.slice(1)
      ]);
    } catch (error) {
      setJobs(prev => [
        {
          jobName,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        ...prev.slice(1)
      ]);
    } finally {
      setRunningJobs(prev => {
        const next = new Set(prev);
        next.delete(jobName);
        return next;
      });
    }
  };

  const availableJobs = [
    {
      name: 'Fetch Analytics',
      description: 'Fetch metrics from GA4 and Search Console (TODO: API integration needed)',
      endpoint: '/api/jobs/fetch-analytics',
      color: 'bg-blue-900/20 text-blue-400',
    },
    {
      name: 'Calculate Performance',
      description: 'Calculate success scores for all posts based on metrics',
      endpoint: '/api/jobs/calc-post-performance',
      color: 'bg-green-900/20 text-green-400',
    },
    {
      name: 'Update Strategy',
      description: 'Analyze top/bottom performers and adjust strategy config',
      endpoint: '/api/jobs/update-strategy',
      color: 'bg-purple-900/20 text-purple-400',
    },
    {
      name: 'Refresh Content',
      description: 'Generate refreshed drafts for underperforming posts',
      endpoint: '/api/jobs/refresh-content',
      color: 'bg-yellow-900/20 text-yellow-400',
    },
    {
      name: 'Daily Content Generation',
      description: 'Generate new content drafts from topics (auto-publish if enabled)',
      endpoint: '/api/jobs/run-daily-content',
      color: 'bg-accent/20 text-accent',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Jobs & Automation</h1>
        <Link
          href="/admin"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Job Triggers */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Manual Triggers</h2>
        <p className="text-sm text-text-secondary mb-6">
          Run jobs manually for testing or immediate execution
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableJobs.map((job) => (
            <div
              key={job.name}
              className={`p-4 rounded-lg border border-border-subtle ${job.color}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{job.name}</h3>
                <button
                  onClick={() => runJob(job.name, job.endpoint)}
                  disabled={runningJobs.has(job.name)}
                  className="bg-bg-primary px-3 py-1 rounded-md text-sm hover:bg-bg-tertiary transition-colors disabled:opacity-50"
                >
                  {runningJobs.has(job.name) ? 'Running...' : 'Run'}
                </button>
              </div>
              <p className="text-xs opacity-80">{job.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job History */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Job Runs</h2>
        
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No jobs run yet. Click a &quot;Run&quot; button above to execute a job.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  job.status === 'running'
                    ? 'bg-blue-900/10 border-blue-900/30'
                    : job.status === 'success'
                    ? 'bg-green-900/10 border-green-900/30'
                    : 'bg-red-900/10 border-red-900/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-text-primary">{job.jobName}</h3>
                    <p className="text-sm text-text-secondary mt-1">{job.message}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-md ${
                      job.status === 'running'
                        ? 'bg-blue-900/20 text-blue-400'
                        : job.status === 'success'
                        ? 'bg-green-900/20 text-green-400'
                        : 'bg-red-900/20 text-red-400'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                
                {job.data && job.status !== 'running' && (
                  <details className="mt-3">
                    <summary className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-bg-tertiary rounded text-xs overflow-x-auto">
                      {JSON.stringify(job.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduling Info */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Production Scheduling</h2>
        <p className="text-sm text-text-secondary mb-4">
          In production, these jobs should be scheduled using cron jobs or a service like GitHub Actions, Vercel Cron, or similar.
        </p>
        
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-bg-tertiary px-2 py-1 rounded">0 2 * * *</span>
            <span>→ Daily Content Generation (2 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-bg-tertiary px-2 py-1 rounded">0 3 * * *</span>
            <span>→ Fetch Analytics (3 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-bg-tertiary px-2 py-1 rounded">0 4 * * *</span>
            <span>→ Calculate Performance (4 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-bg-tertiary px-2 py-1 rounded">0 5 * * 0</span>
            <span>→ Update Strategy (5 AM on Sundays)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-bg-tertiary px-2 py-1 rounded">0 6 * * *</span>
            <span>→ Refresh Content (6 AM)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
