import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.min(
            100,
            Math.max(0, (rating - index) * 100)
          );

          return (
            <div key={index} className="relative">
              <Star
                className={cn(sizes[size], 'text-bg-tertiary fill-bg-tertiary')}
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={cn(sizes[size], 'text-accent fill-accent')}
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-text-secondary ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

export default StarRating;
