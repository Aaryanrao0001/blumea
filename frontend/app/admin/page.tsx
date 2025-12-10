'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  drafts: { total: number; pending: number; approved: number; published: number };
  topics: { total: number; new: number; used: number };
  products: number;
  ingredients: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [draftsRes, topicsRes, productsRes, ingredientsRes] = await Promise.all([
        fetch('/api/admin/drafts'),
        fetch('/api/admin/topics'),
        fetch('/api/admin/products'),
        fetch('/api/admin/ingredients'),
      ]);

      const [draftsData, topicsData, productsData, ingredientsData] = await Promise.all([
        draftsRes.json(),
        topicsRes.json(),
        productsRes.json(),
        ingredientsRes.json(),
      ]);

      const drafts = draftsData.drafts || [];
      const topics = topicsData.topics || [];

      setStats({
        drafts: {
          total: drafts.length,
          pending: drafts.filter((d: { status: string }) => d.status === 'draft').length,
          approved: drafts.filter((d: { status: string }) => d.status === 'approved').length,
          published: drafts.filter((d: { status: string }) => d.status === 'published').length,
        },
        topics: {
          total: topics.length,
          new: topics.filter((t: { status: string }) => t.status === 'new').length,
          used: topics.filter((t: { status: string }) => t.status === 'used').length,
        },
        products: (productsData.products || []).length,
        ingredients: (ingredientsData.ingredients || []).length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer blumea-admin-2024',
        },
      });
      const data = await res.json();
      if (data.success) {
        setSeedResult(`Seeded: ${data.counts.ingredients} ingredients, ${data.counts.products} products, ${data.counts.topics} topics`);
        fetchStats();
      } else {
        setSeedResult(`Error: ${data.message}`);
      }
    } catch (error) {
      setSeedResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <div className="text-text-secondary">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Dashboard</h1>
        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {seeding ? 'Seeding...' : 'Seed Database'}
        </button>
      </div>

      {seedResult && (
        <div className={`p-4 rounded-md ${seedResult.includes('Error') ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
          {seedResult}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <h3 className="text-text-tertiary text-sm uppercase tracking-wide mb-2">Total Drafts</h3>
          <p className="text-4xl font-bold text-text-primary">{stats?.drafts.total || 0}</p>
          <div className="mt-2 text-sm text-text-secondary">
            <span className="text-yellow-400">{stats?.drafts.pending || 0} pending</span>
            {' · '}
            <span className="text-green-400">{stats?.drafts.approved || 0} approved</span>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <h3 className="text-text-tertiary text-sm uppercase tracking-wide mb-2">Topics</h3>
          <p className="text-4xl font-bold text-text-primary">{stats?.topics.total || 0}</p>
          <div className="mt-2 text-sm text-text-secondary">
            <span className="text-blue-400">{stats?.topics.new || 0} new</span>
            {' · '}
            <span className="text-gray-400">{stats?.topics.used || 0} used</span>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <h3 className="text-text-tertiary text-sm uppercase tracking-wide mb-2">Products</h3>
          <p className="text-4xl font-bold text-text-primary">{stats?.products || 0}</p>
          <p className="mt-2 text-sm text-text-secondary">Skincare products</p>
        </div>

        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <h3 className="text-text-tertiary text-sm uppercase tracking-wide mb-2">Ingredients</h3>
          <p className="text-4xl font-bold text-text-primary">{stats?.ingredients || 0}</p>
          <p className="mt-2 text-sm text-text-secondary">In database</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/drafts"
              className="block p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors"
            >
              <div className="font-medium text-text-primary">Review Drafts</div>
              <div className="text-sm text-text-secondary">View and publish AI-generated content</div>
            </a>
            <a
              href="/admin/topics"
              className="block p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors"
            >
              <div className="font-medium text-text-primary">Manage Topics</div>
              <div className="text-sm text-text-secondary">Add or modify content topics</div>
            </a>
            <a
              href="/admin/growth"
              className="block p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors"
            >
              <div className="font-medium text-text-primary">Growth Console</div>
              <div className="text-sm text-text-secondary">AI-powered intelligence and opportunity tracking</div>
            </a>
            <a
              href="/admin/test"
              className="block p-4 bg-bg-tertiary rounded-md hover:bg-bg-primary transition-colors"
            >
              <div className="font-medium text-text-primary">System Test</div>
              <div className="text-sm text-text-secondary">Verify MongoDB and Claude connections</div>
            </a>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Getting Started</h2>
          <ol className="space-y-3 text-text-secondary list-decimal list-inside">
            <li>Click &quot;Seed Database&quot; to populate initial data</li>
            <li>Go to System Test to verify connections</li>
            <li>Add topics for content generation</li>
            <li>Review and publish generated drafts</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
