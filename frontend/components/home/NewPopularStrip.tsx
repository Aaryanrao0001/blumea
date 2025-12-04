'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PostCard } from '@/components/posts/PostCard';
import { IPostPopulated } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NewPopularStripProps {
  newPosts: IPostPopulated[];
  popularPosts: IPostPopulated[];
}

export function NewPopularStrip({ newPosts, popularPosts }: NewPopularStripProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'popular'>('new');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const posts = activeTab === 'new' ? newPosts : popularPosts;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-8 lg:py-12 border-t border-b border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('new')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded transition-all',
              activeTab === 'new'
                ? 'bg-accent text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            NEW
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded transition-all',
              activeTab === 'popular'
                ? 'bg-accent text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            POPULAR
          </button>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-bg-secondary text-text-secondary hover:text-accent hover:bg-bg-tertiary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-bg-secondary text-text-secondary hover:text-accent hover:bg-bg-tertiary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Posts */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            className="flex-shrink-0 w-[280px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard post={post} variant="horizontal" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default NewPopularStrip;
