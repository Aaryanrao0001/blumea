import { Calendar, Clock, User } from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate } from '@/lib/utils';

interface PostMetaProps {
  publishedAt: Date | string;
  readingTime?: number;
  authorName?: string;
  rating?: number;
  showRating?: boolean;
}

export function PostMeta({
  publishedAt,
  readingTime,
  authorName,
  rating,
  showRating = false,
}: PostMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm">
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(publishedAt)}</span>
      </div>
      
      {readingTime && (
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{readingTime} min read</span>
        </div>
      )}
      
      {authorName && (
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{authorName}</span>
        </div>
      )}
      
      {showRating && rating && (
        <StarRating rating={rating} showValue />
      )}
    </div>
  );
}

export default PostMeta;
