import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryData } from '@/lib/types';

interface CategoriesWidgetProps {
  categories: CategoryData[];
}

export function CategoriesWidget({ categories }: CategoriesWidgetProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-secondary rounded-lg p-4 border border-border-subtle">
      <h3 className="font-heading text-lg font-semibold text-text-primary mb-4 uppercase tracking-wide">
        Categories
      </h3>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/category/${category.slug}`}
              className="flex items-center justify-between py-2 text-text-secondary hover:text-accent transition-colors group"
            >
              <span className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>{category.title}</span>
              </span>
              {category.postCount !== undefined && (
                <span className="text-text-tertiary text-sm">
                  ({category.postCount})
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoriesWidget;
