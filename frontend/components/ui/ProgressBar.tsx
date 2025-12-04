import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  max = 5,
  label,
  showValue = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = (value / max) * 100;

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-accent font-medium">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-bg-tertiary rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
