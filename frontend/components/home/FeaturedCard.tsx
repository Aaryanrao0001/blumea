'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PostData } from '@/lib/types';
import { getPlaceholderImage, truncateText } from '@/lib/utils';
import { convertGoogleDriveUrl } from '@/lib/imageUtils';

interface FeaturedCardProps {
  post: PostData;
}

export function FeaturedCard({ post }: FeaturedCardProps) {
  return (
    <motion.article
      className="relative h-full min-h-[400px] lg:min-h-[500px] rounded-xl overflow-hidden group"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Background Image */}
      <Image
        src={convertGoogleDriveUrl(post.coverImage?.url || getPlaceholderImage(600, 500))}
        alt={post.coverImage?.alt || post.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        priority
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
        {/* Category */}
        <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-medium uppercase tracking-wider rounded-full mb-4">
          {typeof post.category === 'object' && 'title' in post.category
            ? post.category.title
            : 'Featured'}
        </span>

        {/* Title */}
        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-text-secondary text-sm lg:text-base mb-4 max-w-lg line-clamp-2">
          {truncateText(post.excerpt, 150)}
        </p>

        {/* CTA */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all"
        >
          Read Review
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Featured Badge */}
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 bg-accent text-bg-primary text-xs font-semibold uppercase tracking-wider rounded-full">
          Featured
        </span>
      </div>
    </motion.article>
  );
}

export default FeaturedCard;
