import { ThumbsUp, ThumbsDown, Quote } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StarRating } from '@/components/ui/StarRating';
import { ICriteriaRating } from '@/lib/types';

interface ReviewSummaryProps {
  overallRating: number;
  criteriaRatings?: ICriteriaRating[];
  pros?: string[];
  cons?: string[];
  verdict?: string;
}

export function ReviewSummary({
  overallRating,
  criteriaRatings = [],
  pros = [],
  cons = [],
  verdict,
}: ReviewSummaryProps) {
  return (
    <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle space-y-6">
      {/* Overall Rating */}
      <div className="text-center pb-6 border-b border-border-subtle">
        <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
          Overall Rating
        </h3>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-heading font-bold text-accent">
            {overallRating.toFixed(1)}
          </span>
          <StarRating rating={overallRating} size="lg" />
        </div>
      </div>

      {/* Criteria Ratings */}
      {criteriaRatings.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-heading text-base font-semibold text-text-primary">
            Detailed Ratings
          </h4>
          {criteriaRatings.map((criteria) => (
            <ProgressBar
              key={criteria.label}
              label={criteria.label}
              value={criteria.score}
              max={5}
            />
          ))}
        </div>
      )}

      {/* Pros & Cons */}
      <div className="grid md:grid-cols-2 gap-6">
        {pros.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-heading text-base font-semibold text-success mb-3">
              <ThumbsUp className="w-5 h-5" />
              Pros
            </h4>
            <ul className="space-y-2">
              {pros.map((pro, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-text-secondary text-sm"
                >
                  <span className="text-success mt-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cons.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-heading text-base font-semibold text-error mb-3">
              <ThumbsDown className="w-5 h-5" />
              Cons
            </h4>
            <ul className="space-y-2">
              {cons.map((con, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-text-secondary text-sm"
                >
                  <span className="text-error mt-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Verdict */}
      {verdict && (
        <div className="pt-6 border-t border-border-subtle">
          <h4 className="flex items-center gap-2 font-heading text-base font-semibold text-text-primary mb-3">
            <Quote className="w-5 h-5 text-accent" />
            Final Verdict
          </h4>
          <p className="text-text-secondary leading-relaxed italic">
            &ldquo;{verdict}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

export default ReviewSummary;
