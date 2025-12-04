import { Metadata } from 'next';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getAllPosts, getPopularPosts, getCategories } from '@/lib/mockData';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Product Reviews',
  description: 'In-depth reviews of premium skincare products. Honest, detailed assessments to help you make informed beauty decisions.',
  path: '/reviews',
});

export default function ReviewsPage() {
  const allPosts = getAllPosts();
  const reviewPosts = allPosts.filter((post) => post.type === 'review');
  const popularPosts = getPopularPosts(5);
  const categories = getCategories();

  return (
    <MainContainer>
      <Breadcrumbs items={[{ label: 'Reviews' }]} />
      
      <header className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
          Product Reviews
        </h1>
        <p className="text-text-secondary max-w-2xl">
          Honest, in-depth reviews of the latest skincare and beauty products. We test everything so you can make informed decisions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <PostGrid posts={reviewPosts} columns={2} />
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
