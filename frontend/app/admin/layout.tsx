'use client';

import { useState, useEffect, ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('admin_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-bg-secondary rounded-lg p-8 shadow-lg">
            <h1 className="text-2xl font-heading font-bold text-accent mb-6 text-center">
              Admin Access
            </h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-text-secondary text-sm mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent"
                  placeholder="Enter admin password"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-bg-primary py-2.5 rounded-md font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="bg-bg-secondary border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/admin" className="text-accent font-heading font-bold text-xl">
                Blumea Admin
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/admin" className="text-text-secondary hover:text-accent transition-colors">
                  Dashboard
                </a>
                <a href="/admin/posts" className="text-text-secondary hover:text-accent transition-colors">
                  Posts
                </a>
                <a href="/admin/drafts" className="text-text-secondary hover:text-accent transition-colors">
                  Drafts
                </a>
                <a href="/admin/topics" className="text-text-secondary hover:text-accent transition-colors">
                  Topics
                </a>
                <a href="/admin/products" className="text-text-secondary hover:text-accent transition-colors">
                  Products
                </a>
                <a href="/admin/ingredients" className="text-text-secondary hover:text-accent transition-colors">
                  Ingredients
                </a>
                <a href="/admin/growth" className="text-text-secondary hover:text-accent transition-colors">
                  Growth
                </a>
                <a href="/admin/performance" className="text-text-secondary hover:text-accent transition-colors">
                  Performance
                </a>
                <a href="/admin/strategy" className="text-text-secondary hover:text-accent transition-colors">
                  Strategy
                </a>
                <a href="/admin/strategy-insights" className="text-text-secondary hover:text-accent transition-colors">
                  Strategy Insights
                </a>
                <a href="/admin/test" className="text-text-secondary hover:text-accent transition-colors">
                  System Test
                </a>
              </nav>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('admin_auth');
                setIsAuthenticated(false);
              }}
              className="text-text-tertiary hover:text-text-primary transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
