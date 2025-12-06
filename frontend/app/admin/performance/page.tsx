'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PerformanceData {
  _id: string;
  postId: string;
  postTitle: string;
  postSlug: string;
  categorySlug: string;
  postType: string;
  successScore: number;
  engagementScore: number;
  seoScore: number;
  monetizationScore: number;
  lastCalculatedAt: string;
}

export default function PerformancePage() {
  const [performances, setPerformances] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof PerformanceData>('successScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      const res = await fetch('/api/admin/performance');
      const data = await res.json();
      setPerformances(data.performances || []);
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number): string => {
    if (score >= 80) return 'bg-green-900/20 text-green-400';
    if (score >= 60) return 'bg-blue-900/20 text-blue-400';
    if (score >= 40) return 'bg-yellow-900/20 text-yellow-400';
    return 'bg-red-900/20 text-red-400';
  };

  const filteredPerformances = performances
    .filter((p) => {
      if (filterCategory !== 'all' && p.categorySlug !== filterCategory) return false;
      if (filterType !== 'all' && p.postType !== filterType) return false;
      if (filterTier !== 'all') {
        if (filterTier === 'high' && p.successScore < 80) return false;
        if (filterTier === 'medium' && (p.successScore < 60 || p.successScore >= 80)) return false;
        if (filterTier === 'low' && p.successScore >= 60) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  const categories = Array.from(new Set(performances.map((p) => p.categorySlug)));

  if (loading) {
    return <div className="text-text-secondary">Loading performance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Post Performance</h1>
        <Link
          href="/admin"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary border border-border-subtle rounded-md px-3 py-2"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary border border-border-subtle rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="blog">Blog</option>
              <option value="review">Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Performance Tier</label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary border border-border-subtle rounded-md px-3 py-2"
            >
              <option value="all">All Tiers</option>
              <option value="high">High (80+)</option>
              <option value="medium">Medium (60-79)</option>
              <option value="low">Low (&lt;60)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as keyof PerformanceData)}
              className="w-full bg-bg-tertiary text-text-primary border border-border-subtle rounded-md px-3 py-2"
            >
              <option value="successScore">Success Score</option>
              <option value="engagementScore">Engagement</option>
              <option value="seoScore">SEO</option>
              <option value="monetizationScore">Monetization</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="bg-bg-tertiary text-text-primary px-4 py-2 rounded-md hover:bg-bg-primary transition-colors"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
          <div className="text-sm text-text-secondary ml-auto">
            Showing {filteredPerformances.length} of {performances.length} posts
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-bg-secondary rounded-lg border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Success
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  SEO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Monetization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredPerformances.map((perf) => (
                <tr key={perf._id} className="hover:bg-bg-tertiary transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-text-primary">{perf.postTitle}</div>
                    <div className="text-xs text-text-secondary">{perf.categorySlug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-md bg-bg-tertiary text-text-secondary">
                      {perf.postType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-2xl font-bold ${getScoreColor(perf.successScore)}`}>
                      {perf.successScore}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-sm rounded-md ${getScoreBadge(perf.engagementScore)}`}>
                      {perf.engagementScore}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-sm rounded-md ${getScoreBadge(perf.seoScore)}`}>
                      {perf.seoScore}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-sm rounded-md ${getScoreBadge(perf.monetizationScore)}`}>
                      {perf.monetizationScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(perf.lastCalculatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPerformances.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No performance data available. Run the calc-post-performance job to generate data.
        </div>
      )}
    </div>
  );
}
