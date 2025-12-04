import { cn } from '@/lib/utils';

interface PillProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

export function Pill({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: PillProps) {
  const variants = {
    default: 'bg-bg-tertiary text-text-secondary',
    accent: 'bg-accent/20 text-accent',
    muted: 'bg-bg-secondary text-text-tertiary',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium uppercase tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Pill;
