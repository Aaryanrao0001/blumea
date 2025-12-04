'use client';

import { motion } from 'framer-motion';
import { PostCard } from '@/components/posts/PostCard';
import { PostData } from '@/lib/types';

interface PostGridProps {
  posts: PostData[];
  title?: string;
  columns?: 2 | 3;
}

export function PostGrid({ posts, title, columns = 3 }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <section className="py-8">
        {title && (
          <h2 className="font-heading text-2xl font-semibold text-text-primary mb-6">
            {title}
          </h2>
        )}
        <p className="text-text-secondary text-center py-12">
          No posts found.
        </p>
      </section>
    );
  }

  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-8">
      {title && (
        <h2 className="font-heading text-2xl font-semibold text-text-primary mb-6">
          {title}
        </h2>
      )}
      <motion.div
        className={`grid grid-cols-1 ${gridCols} gap-6`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default PostGrid;
