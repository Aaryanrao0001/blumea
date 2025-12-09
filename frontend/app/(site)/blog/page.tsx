import { Metadata } from 'next';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getAllPostsPhase3 } from '@/lib/db/repositories/posts';
import { getAllCategories } from '@/lib/db/repositories/categories';
import { generatePageMetadata } from '@/lib/seo';
import { convertPhase3PostToPostData } from '@/lib/utils';

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog',
  description: 'Expert skincare tips, beauty guides, and wellness insights. Learn from industry experts and discover your radiance.',
  path: '/blog',
});

export default async function BlogPage() {
  // Fetch published blog posts from database
  const { posts: allPosts } = await getAllPostsPhase3({ 
    status: 'published', 
    postType: 'blog',
    limit: 100 
  });
  
  // Get popular posts (we'll just use the first 5 from all posts for now)
  const popularPosts = allPosts.filter(p => p.isPopular).slice(0, 5);
  const categories = await getAllCategories();

  // Convert to PostData format
  const allPostsConverted = allPosts.map(convertPhase3PostToPostData);
  const popularPostsConverted = popularPosts.map(convertPhase3PostToPostData);

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

      {allPostsConverted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No blog posts available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <PostGrid posts={allPostsConverted} columns={2} />
          </div>
          <aside className="lg:col-span-3">
            <Sidebar
              popularPosts={popularPostsConverted}
              categories={categories}
            />
          </aside>
        </div>
      )}
    </MainContainer>
  );
}
