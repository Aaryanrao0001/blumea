'use client';

import { useState, useEffect } from 'react';

interface Draft {
  _id: string;
  title: string;
  slug: string;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  postType: 'blog' | 'review';
  wordCount: number;
  createdAt: string;
  createdBy: 'system' | 'admin';
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDrafts();
  }, [filter]);

  const fetchDrafts = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/drafts' 
        : `/api/admin/drafts?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDrafts();
      }
    } catch (error) {
      console.error('Error updating draft:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/drafts/${id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchDrafts();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-yellow-900/20 text-yellow-400',
      approved: 'bg-green-900/20 text-green-400',
      rejected: 'bg-red-900/20 text-red-400',
      published: 'bg-blue-900/20 text-blue-400',
    };
    return colors[status] || 'bg-gray-900/20 text-gray-400';
  };

  if (loading) {
    return <div className="text-text-secondary">Loading drafts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Drafts</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-bg-secondary rounded-lg p-8 text-center border border-border-subtle">
          <p className="text-text-secondary">No drafts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft._id}
              className="bg-bg-secondary rounded-lg p-6 border border-border-subtle"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(draft.status)}`}>
                      {draft.status}
                    </span>
                    <span className="text-text-tertiary text-sm">
                      {draft.postType} · {draft.wordCount} words
                    </span>
                  </div>
                  <a
                    href={`/admin/drafts/${draft._id}`}
                    className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
                  >
                    {draft.title}
                  </a>
                  <p className="text-text-tertiary text-sm mt-1">
                    Created {new Date(draft.createdAt).toLocaleDateString()} by {draft.createdBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {draft.status === 'draft' && (
                    <>
                      <button
                        onClick={() => handleAction(draft._id, 'approve')}
                        className="px-3 py-1.5 bg-green-900/20 text-green-400 rounded hover:bg-green-900/40 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(draft._id, 'reject')}
                        className="px-3 py-1.5 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {draft.status === 'approved' && (
                    <button
                      onClick={() => handlePublish(draft._id)}
                      className="px-3 py-1.5 bg-accent text-bg-primary rounded hover:bg-accent-hover transition-colors text-sm"
                    >
                      Publish
                    </button>
                  )}
                  <a
                    href={`/admin/drafts/${draft._id}`}
                    className="px-3 py-1.5 bg-bg-tertiary text-text-secondary rounded hover:text-text-primary transition-colors text-sm"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
