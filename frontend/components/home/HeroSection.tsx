'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeroSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
  ctaLink?: string;
  ctaText?: string;
  secondaryLink?: string;
  secondaryText?: string;
}

export function HeroSection({
  label = 'SKINCARE & WELLNESS',
  title,
  subtitle,
  ctaLink = '/reviews',
  ctaText = 'Read Review',
  secondaryLink = '/blog',
  secondaryText = 'Browse All Stories',
}: HeroSectionProps) {
  return (
    <motion.section
      className="flex flex-col justify-center h-full py-8 lg:py-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Label */}
      <motion.span
        className="text-accent text-xs font-medium tracking-widest uppercase mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {label}
      </motion.span>

      {/* Title */}
      <motion.h1
        className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary leading-tight mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className="text-text-secondary text-base lg:text-lg leading-relaxed mb-8 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* CTAs */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link href={ctaLink}>
          <Button variant="primary" size="lg">
            {ctaText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        <Link href={secondaryLink}>
          <Button variant="outline" size="lg">
            {secondaryText}
          </Button>
        </Link>
      </motion.div>
    </motion.section>
  );
}

export default HeroSection;
