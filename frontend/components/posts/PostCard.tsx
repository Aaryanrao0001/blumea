'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar } from 'lucide-react';
import { Pill } from '@/components/ui/Pill';
import { StarRating } from '@/components/ui/StarRating';
import { PostData } from '@/lib/types';
import { formatDate, getPlaceholderImage, truncateText } from '@/lib/utils';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';

interface PostCardProps {
  post: PostData;
  variant?: 'default' | 'horizontal' | 'compact';
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  const categoryTitle =
    typeof post.category === 'object' && 'title' in post.category
      ? post.category.title
      : 'Uncategorized';

  if (variant === 'horizontal') {
    return (
      <motion.article
        className="flex gap-4 bg-bg-secondary rounded-lg overflow-hidden border border-border-subtle group"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="relative w-32 h-24 flex-shrink-0"
        >
          <Image
            src={convertGoogleDriveUrl(post.coverImage?.url || getPlaceholderImage(128, 96))}
            alt={post.coverImage?.alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="flex-1 py-2 pr-4">
          <Pill variant="accent" size="sm" className="mb-1">
            {categoryTitle}
          </Pill>
          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-text-primary font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
              {post.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1 text-text-tertiary text-xs">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime || 5} min</span>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.article
        className="flex gap-3 group"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden"
        >
          <Image
            src={convertGoogleDriveUrl(post.coverImage?.url || getPlaceholderImage(64, 64))}
            alt={post.coverImage?.alt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Pill variant="accent" size="sm" className="mb-1">
            {categoryTitle}
          </Pill>
          <Link href={`/blog/${post.slug}`}>
            <h4 className="text-text-primary text-sm font-medium line-clamp-2 group-hover:text-accent transition-colors">
              {post.title}
            </h4>
          </Link>
          <div className="flex items-center gap-1 mt-1 text-text-tertiary text-xs">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime || 5} min read</span>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="bg-bg-secondary rounded-lg overflow-hidden border border-border-subtle group"
      whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(212, 175, 55, 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block relative h-48 overflow-hidden"
      >
        <Image
          src={convertGoogleDriveUrl(post.coverImage?.url || getPlaceholderImage(400, 300))}
          alt={post.coverImage?.alt || post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent" />
      </Link>
      
      <div className="p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-2">
          <Pill variant="accent">{categoryTitle}</Pill>
          {post.type === 'review' && post.overallRating && (
            <StarRating rating={post.overallRating} size="sm" />
          )}
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-heading text-lg lg:text-xl font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {truncateText(post.excerpt, 120)}
        </p>
        
        <div className="flex items-center justify-between text-text-tertiary text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime || 5} min</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default PostCard;
