'use client';

import { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Eye, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  labPosts: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    labPosts: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch analytics data from API
      // For now, we'll just show a placeholder
      setData({
        totalPosts: 0,
        publishedPosts: 0,
        scheduledPosts: 0,
        draftPosts: 0,
        labPosts: 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-text-secondary">Loading analytics...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-accent mb-2">Analytics Dashboard</h1>
        <p className="text-text-secondary">Track your blog performance and content metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<BarChart className="w-6 h-6" />}
          label="Total Posts"
          value={data.totalPosts}
          color="text-blue-400"
        />
        <StatCard
          icon={<Eye className="w-6 h-6" />}
          label="Published"
          value={data.publishedPosts}
          color="text-green-400"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Scheduled"
          value={data.scheduledPosts}
          color="text-yellow-400"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="In Lab"
          value={data.labPosts}
          color="text-purple-400"
        />
      </div>

      {/* Content Status Breakdown */}
      <div className="bg-bg-secondary rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Content Status Breakdown</h2>
        <div className="space-y-3">
          <StatusBar label="Published" count={data.publishedPosts} total={data.totalPosts} color="bg-green-500" />
          <StatusBar label="Scheduled" count={data.scheduledPosts} total={data.totalPosts} color="bg-yellow-500" />
          <StatusBar label="Lab" count={data.labPosts} total={data.totalPosts} color="bg-purple-500" />
          <StatusBar label="Draft" count={data.draftPosts} total={data.totalPosts} color="bg-gray-500" />
        </div>
      </div>

      {/* Google Analytics Integration */}
      <div className="bg-bg-secondary rounded-lg p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Google Analytics</h2>
        <p className="text-text-secondary mb-4">
          Google Analytics is integrated and tracking page views, events, and user behavior.
        </p>
        <div className="bg-bg-tertiary border border-border-subtle rounded-md p-4">
          <h3 className="text-text-primary font-medium mb-2">Tracking ID: G-0FZVHEXGDX</h3>
          <p className="text-text-tertiary text-sm">
            Visit <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google Analytics Dashboard</a> to view detailed reports.
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={color}>{icon}</div>
        <h3 className="text-text-secondary text-sm font-medium">{label}</h3>
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatusBar({ label, count, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-text-secondary text-sm">{label}</span>
        <span className="text-text-primary text-sm font-medium">{count}</span>
      </div>
      <div className="w-full bg-bg-tertiary rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
