'use client';

import { useState, useEffect } from 'react';

interface PostPerformance {
  _id: string;
  postId: {
    _id: string;
    title: string;
    postType: string;
    categorySlug: string;
  };
  successScore: number;
  engagementScore: number;
  seoScore: number;
  monetizationScore: number;
  lastCalculated: string;
}

export default function AdminPerformancePage() {
  const [performances, setPerformances] = useState<PostPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    postType: '',
    minScore: 0,
  });

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    setLoading(true);
    try {
      // TODO: Create API endpoint to fetch performances with post details
      // For now, this is a placeholder
      setPerformances([]);
    } catch (error) {
      console.error('Error fetching performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPerformances = performances.filter((perf) => {
    if (filter.category && perf.postId.categorySlug !== filter.category) return false;
    if (filter.postType && perf.postId.postType !== filter.postType) return false;
    if (perf.successScore < filter.minScore) return false;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-accent mb-6">Post Performance</h1>

      {/* Filters */}
      <div className="bg-bg-secondary rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Category</label>
            <input
              type="text"
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              placeholder="Filter by category slug"
              className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">Type</label>
            <select
              value={filter.postType}
              onChange={(e) => setFilter({ ...filter, postType: e.target.value })}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
            >
              <option value="">All</option>
              <option value="blog">Blog</option>
              <option value="review">Review</option>
            </select>
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">Min Score</label>
            <input
              type="number"
              value={filter.minScore}
              onChange={(e) => setFilter({ ...filter, minScore: parseInt(e.target.value) || 0 })}
              min="0"
              max="100"
              className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Performance Table */}
      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading performance data...</div>
      ) : filteredPerformances.length === 0 ? (
        <div className="bg-bg-secondary rounded-lg p-12 text-center">
          <p className="text-text-secondary">No performance data available.</p>
          <p className="text-text-tertiary text-sm mt-2">
            Run the calc-post-performance job to generate metrics.
          </p>
        </div>
      ) : (
        <div className="bg-bg-secondary rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Post</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-right text-text-secondary text-sm font-medium">Success Score</th>
                <th className="px-4 py-3 text-right text-text-secondary text-sm font-medium">Engagement</th>
                <th className="px-4 py-3 text-right text-text-secondary text-sm font-medium">SEO</th>
                <th className="px-4 py-3 text-right text-text-secondary text-sm font-medium">Monetization</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerformances.map((perf) => (
                <tr key={perf._id} className="border-t border-border-subtle hover:bg-bg-tertiary/50">
                  <td className="px-4 py-3">
                    <div className="text-text-primary">{perf.postId.title}</div>
                    <div className="text-text-tertiary text-xs">{perf.postId.categorySlug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 text-xs rounded bg-accent/20 text-accent">
                      {perf.postId.postType}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${getScoreColor(perf.successScore)}`}>
                    {perf.successScore.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getScoreColor(perf.engagementScore)}`}>
                    {perf.engagementScore.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getScoreColor(perf.seoScore)}`}>
                    {perf.seoScore.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getScoreColor(perf.monetizationScore)}`}>
                    {perf.monetizationScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {new Date(perf.lastCalculated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
