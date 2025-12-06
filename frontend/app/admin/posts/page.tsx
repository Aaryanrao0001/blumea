'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  _id: string;
  title: string;
  postType: string;
  status: string;
  source: string;
  createdAt: string;
  publishedAt?: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    postType: '',
    source: '',
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter.status && { status: filter.status }),
        ...(filter.postType && { postType: filter.postType }),
        ...(filter.source && { source: filter.source }),
      });

      const res = await fetch(`/api/admin/posts?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setPosts(data.posts);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        fetchPosts();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-accent">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-accent text-bg-primary px-4 py-2 rounded-md font-medium hover:bg-accent-hover transition-colors"
        >
          Create New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-bg-secondary rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="lab">Lab</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
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
            <label className="block text-text-secondary text-sm mb-2">Source</label>
            <select
              value={filter.source}
              onChange={(e) => setFilter({ ...filter, source: e.target.value })}
              className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-3 py-2 text-text-primary"
            >
              <option value="">All</option>
              <option value="ai">AI</option>
              <option value="manual">Manual</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading posts...</div>
      ) : (
        <div className="bg-bg-secondary rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-tertiary">
              <tr>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Source</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Created</th>
                <th className="px-4 py-3 text-left text-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post._id} className="border-t border-border-subtle hover:bg-bg-tertiary/50">
                  <td className="px-4 py-3 text-text-primary">{post.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 text-xs rounded bg-accent/20 text-accent">
                      {post.postType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={post.status}
                      onChange={(e) => handleStatusChange(post._id, e.target.value)}
                      className="bg-bg-tertiary border border-border-subtle rounded px-2 py-1 text-sm text-text-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="lab">Lab</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">{post.source}</td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/posts/${post._id}`}
                        className="text-accent hover:text-accent-hover text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {posts.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No posts found. Create your first post!
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-text-secondary text-sm">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} posts
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded-md text-text-primary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= total}
              className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded-md text-text-primary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
