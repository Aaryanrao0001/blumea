'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPlaceholderImage } from '@/lib/utils';

export default function PostEditorPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const isNew = postId === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    postType: 'blog' as 'blog' | 'review',
    status: 'draft' as 'draft' | 'lab' | 'scheduled' | 'published' | 'archived',
    source: 'manual' as 'ai' | 'manual' | 'mixed',
    excerpt: '',
    bodyRaw: '',
    categorySlug: '',
    tagSlugs: '',
    seoTitle: '',
    seoDescription: '',
    isFeatured: false,
    isPopular: false,
    coverImageUrl: '',
    coverImageAlt: '',
  });

  useEffect(() => {
    if (!isNew) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, isNew]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/posts?id=${postId}`);
      const data = await res.json();
      
      if (data.success) {
        const post = data.post;
        setFormData({
          title: post.title || '',
          postType: post.postType || 'blog',
          status: post.status || 'draft',
          source: post.source || 'manual',
          excerpt: post.excerpt || '',
          bodyRaw: post.bodyRaw || '',
          categorySlug: post.categorySlug || '',
          tagSlugs: (post.tagSlugs || []).join(', '),
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          isFeatured: post.isFeatured || false,
          isPopular: post.isPopular || false,
          coverImageUrl: post.images?.cover?.url || post.images?.featured?.url || '',
          coverImageAlt: post.images?.cover?.alt || post.images?.featured?.alt || '',
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const tagSlugsArray = formData.tagSlugs
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const imageObject = formData.coverImageUrl ? {
        url: formData.coverImageUrl,
        alt: formData.coverImageAlt || formData.title,
      } : undefined;

      const payload = {
        ...formData,
        tagSlugs: tagSlugsArray,
        images: {
          cover: imageObject,
          featured: imageObject,
        },
        ...(isNew ? {} : { id: postId }),
      };

      const res = await fetch('/api/admin/posts', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(isNew ? 'Post created successfully!' : 'Post updated successfully!');
        router.push('/admin/posts');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-text-secondary">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-accent">
          {isNew ? 'Create New Post' : 'Edit Post'}
        </h1>
        <button
          onClick={() => router.push('/admin/posts')}
          className="text-text-secondary hover:text-text-primary"
        >
          ← Back to Posts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Fields */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Core Content</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">Post Type *</label>
                <select
                  value={formData.postType}
                  onChange={(e) => setFormData({ ...formData, postType: e.target.value as 'blog' | 'review' })}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
                >
                  <option value="blog">Blog</option>
                  <option value="review">Review</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="lab">Lab</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">Excerpt *</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                required
                rows={3}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">Body Content (Markdown) *</label>
              <textarea
                value={formData.bodyRaw}
                onChange={(e) => setFormData({ ...formData, bodyRaw: e.target.value })}
                required
                rows={15}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">Category Slug</label>
                <input
                  type="text"
                  value={formData.categorySlug}
                  onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                  placeholder="e.g., skincare"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tagSlugs}
                  onChange={(e) => setFormData({ ...formData, tagSlugs: e.target.value })}
                  placeholder="e.g., retinol, vitamin-c"
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Cover Image</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">Cover Image URL</label>
              <input
                type="url"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">Cover Image Alt Text</label>
              <input
                type="text"
                value={formData.coverImageAlt}
                onChange={(e) => setFormData({ ...formData, coverImageAlt: e.target.value })}
                placeholder="Descriptive text for the image"
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            {/* Image Preview */}
            {formData.coverImageUrl && (
              <div>
                <label className="block text-text-secondary text-sm mb-2">Preview</label>
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border-subtle">
                  <img
                    src={formData.coverImageUrl}
                    alt={formData.coverImageAlt || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImage(800, 600);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SEO Fields */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">SEO</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">SEO Title</label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                placeholder="Defaults to title if empty"
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">SEO Description</label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                placeholder="Defaults to excerpt if empty"
                rows={3}
                className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="bg-bg-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Display Options</h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-text-secondary">Featured Post (show in hero)</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-text-secondary">Popular Post (show in slider)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-bg-primary px-6 py-2.5 rounded-md font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isNew ? 'Create Post' : 'Update Post'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="bg-bg-tertiary text-text-primary px-6 py-2.5 rounded-md font-medium hover:bg-bg-secondary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
