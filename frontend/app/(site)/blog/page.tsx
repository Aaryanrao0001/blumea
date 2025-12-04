import { Metadata } from 'next';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getAllPosts, getPopularPosts, getCategories } from '@/lib/mockData';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog',
  description: 'Expert skincare tips, beauty guides, and wellness insights. Learn from industry experts and discover your radiance.',
  path: '/blog',
});

export default function BlogPage() {
  const allPosts = getAllPosts();
  const blogPosts = allPosts.filter((post) => post.type === 'blog');
  const popularPosts = getPopularPosts(5);
  const categories = getCategories();

  return (
    <MainContainer>
      <Breadcrumbs items={[{ label: 'Blog' }]} />
      
      <header className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
          Blog
        </h1>
        <p className="text-text-secondary max-w-2xl">
          Expert skincare tips, beauty guides, and wellness insights to help you achieve your best skin ever.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <PostGrid posts={blogPosts} columns={2} />
        </div>
        <aside className="lg:col-span-3">
          <Sidebar
            popularPosts={popularPosts}
            categories={categories}
          />
        </aside>
      </div>
    </MainContainer>
  );
}
