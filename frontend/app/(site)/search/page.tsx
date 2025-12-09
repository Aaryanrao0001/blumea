'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/utils';

interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  images?: {
    featured?: {
      url: string;
      alt: string;
    };
  };
  publishedAt: string;
  categorySlug?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      
      if (!res.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await res.json();

      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      // You could set an error state here if you want to show an error message to users
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-accent mb-6">
            Search
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-6 py-4 pr-14 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Search className="w-6 h-6" />
              )}
            </button>
          </form>

          {query.trim().length < 2 && query.length > 0 && (
            <p className="text-text-tertiary text-sm mt-2">
              Please enter at least 2 characters to search
            </p>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg mb-2">No results found for &quot;{query}&quot;</p>
            <p className="text-text-tertiary">Try different keywords or check your spelling</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-text-secondary mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>

            <div className="space-y-6">
              {results.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="block bg-bg-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent transition-all group"
                >
                  <div className="flex gap-6 p-6">
                    {/* Image */}
                    {post.images?.featured?.url && (
                      <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.images.featured.url}
                          alt={post.images.featured.alt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = getPlaceholderImage(300, 300);
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-heading font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-text-secondary text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-text-tertiary">
                        {post.categorySlug && (
                          <span className="px-2 py-1 bg-bg-tertiary rounded-full capitalize">
                            {post.categorySlug.replace(/-/g, ' ')}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary text-lg">
              Enter a search query to find articles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
