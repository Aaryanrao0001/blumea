import { cn } from '@/lib/utils';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContainer({ children, className }: MainContainerProps) {
  return (
    <main className={cn('flex-1', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {children}
      </div>
    </main>
  );
}

export default MainContainer;
