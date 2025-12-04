import Image from 'next/image';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Pill } from '@/components/ui/Pill';
import { PostData } from '@/lib/types';
import { getPlaceholderImage } from '@/lib/utils';

interface PopularPostsWidgetProps {
  posts: PostData[];
}

export function PopularPostsWidget({ posts }: PopularPostsWidgetProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
      <h3 className="font-heading text-lg font-semibold text-text-primary mb-4 uppercase tracking-wide">
        Popular Posts
      </h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex gap-3 group"
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={post.coverImage?.url || getPlaceholderImage(64, 64)}
                alt={post.coverImage?.alt || post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Pill variant="accent" size="sm" className="mb-1">
                {typeof post.category === 'object' && 'title' in post.category
                  ? post.category.title
                  : 'Uncategorized'}
              </Pill>
              <h4 className="text-text-primary text-sm font-medium line-clamp-2 group-hover:text-accent transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center gap-1 mt-1 text-text-tertiary text-xs">
                <Clock className="w-3 h-3" />
                <span>{post.readingTime || 5} min read</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PopularPostsWidget;
