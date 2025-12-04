'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';

export function SearchWidget() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
      <form onSubmit={handleSubmit}>
        <Input
          type="search"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </form>
    </div>
  );
}

export default SearchWidget;
