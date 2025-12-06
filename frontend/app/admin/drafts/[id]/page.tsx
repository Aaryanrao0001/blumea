'use client';

import { useState, useEffect } from 'react';

interface Draft {
  _id: string;
  topicId: string;
  productIds: string[];
  postType: 'blog' | 'review';
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  categorySlug: string;
  tagSlugs: string[];
  seoTitle: string;
  seoDescription: string;
  schemaJson: object;
  faq: { question: string; answer: string }[];
  outline: string[];
  bodyRaw: string;
  wordCount: number;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  createdBy: 'system' | 'admin';
  createdAt: string;
  updatedAt: string;
  publishedPostId?: string;
}

// ✅ params is a plain object, not a Promise
export default function DraftDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedBody, setEditedBody] = useState('');

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`/api/admin/drafts?id=${id}`);
        const data = await res.json();
        if (data.success) {
          setDraft(data.draft);
          setEditedBody(data.draft.bodyRaw);
        }
      } catch (error) {
        console.error('Error fetching draft:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDraft();
  }, [id]);

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        setDraft(data.draft);
      }
    } catch (error) {
      console.error('Error updating draft:', error);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/drafts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          bodyRaw: editedBody,
          wordCount: editedBody.split(/\s+/).length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDraft(data.draft);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/admin/drafts/${id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        // re-fetch to update status
        setLoading(true);
        const res2 = await fetch(`/api/admin/drafts?id=${id}`);
        const data2 = await res2.json();
        if (data2.success) setDraft(data2.draft);
        setLoading(false);
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
    return <div className="text-text-secondary">Loading draft...</div>;
  }

  if (!draft) {
    return <div className="text-text-secondary">Draft not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <a href="/admin/drafts" className="text-accent hover:underline text-sm mb-2 inline-block">
            ← Back to Drafts
          </a>
          <h1 className="text-3xl font-heading font-bold text-text-primary">{draft.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {draft.status === 'draft' && (
            <>
              <button
                onClick={() => handleAction('approve')}
                className="px-4 py-2 bg-green-900/20 text-green-400 rounded hover:bg-green-900/40 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction('reject')}
                className="px-4 py-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          {draft.status === 'approved' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-accent text-bg-primary rounded hover:bg-accent-hover transition-colors"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">Content</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 bg-bg-tertiary text-text-secondary rounded hover:text-text-primary transition-colors text-sm"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-accent text-bg-primary rounded hover:bg-accent-hover transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditedBody(draft.bodyRaw);
                    }}
                    className="px-3 py-1.5 bg-bg-tertiary text-text-secondary rounded hover:text-text-primary transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {editing ? (
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="w-full h-96 bg-bg-tertiary border border-border-subtle rounded-md p-4 text-text-primary font-mono text-sm"
              />
            ) : (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: draft.bodyRaw }}
              />
            )}
          </div>

          {draft.faq.length > 0 && (
            <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
              <h2 className="text-xl font-semibold text-text-primary mb-4">FAQ</h2>
              <div className="space-y-4">
                {draft.faq.map((item, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-text-primary">{item.question}</h3>
                    <p className="text-text-secondary mt-1">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Details</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-text-tertiary text-sm">Status</dt>
                <dd>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                      draft.status
                    )}`}
                  >
                    {draft.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Type</dt>
                <dd className="text-text-primary">{draft.postType}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Word Count</dt>
                <dd className="text-text-primary">{draft.wordCount}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Category</dt>
                <dd className="text-text-primary">{draft.categorySlug}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Created</dt>
                <dd className="text-text-primary">
                  {new Date(draft.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Created By</dt>
                <dd className="text-text-primary">{draft.createdBy}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
            <h2 className="text-xl font-semibold text-text-primary mb-4">SEO</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-text-tertiary text-sm">Title</dt>
                <dd className="text-text-primary">{draft.seoTitle}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Description</dt>
                <dd className="text-text-secondary text-sm">{draft.seoDescription}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-sm">Slug</dt>
                <dd className="text-text-primary font-mono text-sm">{draft.slug}</dd>
              </div>
            </dl>
          </div>

          {draft.outline.length > 0 && (
            <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Outline</h2>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm">
                {draft.outline.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
