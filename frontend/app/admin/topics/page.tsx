'use client';

import { useState, useEffect } from 'react';

interface Topic {
  _id: string;
  title: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  ideaType: 'trend' | 'evergreen' | 'update';
  source: string;
  trendScore: number;
  monetizationScore: number;
  status: 'new' | 'selected' | 'used' | 'rejected';
  createdAt: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    ideaType: 'evergreen' as 'trend' | 'evergreen' | 'update',
    source: 'manual' as 'manual' | 'google_trends' | 'tiktok' | 'reddit' | 'other',
    trendScore: 50,
    monetizationScore: 50,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics');
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          secondaryKeywords: formData.secondaryKeywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTopics();
        setShowForm(false);
        setFormData({
          title: '',
          primaryKeyword: '',
          secondaryKeywords: '',
          ideaType: 'evergreen',
          source: 'manual',
          trendScore: 50,
          monetizationScore: 50,
        });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      const res = await fetch(`/api/admin/topics?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchTopics();
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-900/20 text-blue-400',
      selected: 'bg-yellow-900/20 text-yellow-400',
      used: 'bg-gray-900/20 text-gray-400',
      rejected: 'bg-red-900/20 text-red-400',
    };
    return colors[status] || 'bg-gray-900/20 text-gray-400';
  };

  if (loading) {
    return <div className="text-text-secondary">Loading topics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Topics</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Topic'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-secondary rounded-lg p-6 border border-border-subtle space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Primary Keyword</label>
              <input
                type="text"
                value={formData.primaryKeyword}
                onChange={(e) => setFormData({ ...formData, primaryKeyword: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-text-secondary text-sm mb-1">Secondary Keywords (comma separated)</label>
              <input
                type="text"
                value={formData.secondaryKeywords}
                onChange={(e) => setFormData({ ...formData, secondaryKeywords: e.target.value })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Idea Type</label>
              <select
                value={formData.ideaType}
                onChange={(e) => setFormData({ ...formData, ideaType: e.target.value as 'trend' | 'evergreen' | 'update' })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              >
                <option value="evergreen">Evergreen</option>
                <option value="trend">Trend</option>
                <option value="update">Update</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as 'manual' | 'google_trends' | 'tiktok' | 'reddit' | 'other' })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              >
                <option value="manual">Manual</option>
                <option value="google_trends">Google Trends</option>
                <option value="tiktok">TikTok</option>
                <option value="reddit">Reddit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Trend Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.trendScore}
                onChange={(e) => setFormData({ ...formData, trendScore: parseInt(e.target.value) })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Monetization Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.monetizationScore}
                onChange={(e) => setFormData({ ...formData, monetizationScore: parseInt(e.target.value) })}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
            >
              Create Topic
            </button>
          </div>
        </form>
      )}

      {topics.length === 0 ? (
        <div className="bg-bg-secondary rounded-lg p-8 text-center border border-border-subtle">
          <p className="text-text-secondary">No topics found. Add your first topic!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <div
              key={topic._id}
              className="bg-bg-secondary rounded-lg p-6 border border-border-subtle"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(topic.status)}`}>
                      {topic.status}
                    </span>
                    <span className="text-text-tertiary text-sm">
                      {topic.ideaType} · {topic.source}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">{topic.title}</h3>
                  <p className="text-text-secondary mt-1">
                    Keyword: <span className="text-accent">{topic.primaryKeyword}</span>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-tertiary">
                    <span>Trend: {topic.trendScore}</span>
                    <span>Monetization: {topic.monetizationScore}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(topic._id)}
                  className="px-3 py-1.5 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
