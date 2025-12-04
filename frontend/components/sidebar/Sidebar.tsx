import { SearchWidget } from './SearchWidget';
import { PopularPostsWidget } from './PopularPostsWidget';
import { CategoriesWidget } from './CategoriesWidget';
import { NewsletterWidget } from './NewsletterWidget';
import { IPostPopulated, ICategory } from '@/lib/types';

interface SidebarProps {
  popularPosts?: IPostPopulated[];
  categories?: (ICategory & { postCount?: number })[];
  showSearch?: boolean;
  showNewsletter?: boolean;
}

export function Sidebar({
  popularPosts = [],
  categories = [],
  showSearch = true,
  showNewsletter = true,
}: SidebarProps) {
  return (
    <aside className="space-y-6">
      {showSearch && <SearchWidget />}
      {popularPosts.length > 0 && <PopularPostsWidget posts={popularPosts} />}
      {categories.length > 0 && <CategoriesWidget categories={categories} />}
      {showNewsletter && <NewsletterWidget />}
    </aside>
  );
}

export default Sidebar;
