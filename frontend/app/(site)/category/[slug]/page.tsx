import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getAllPostsPhase3 } from '@/lib/db/repositories/posts';
import { getAllCategories, getCategoryBySlug } from '@/lib/db/repositories/categories';
import { generatePageMetadata } from '@/lib/seo';
import { convertPhase3PostToPostData } from '@/lib/utils';

// Make this page dynamic since it fetches from database
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return generatePageMetadata({
      title: 'Category Not Found',
      path: `/category/${slug}`,
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: category.title,
    description: category.description || `Browse all ${category.title} posts`,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // Fetch posts for this category efficiently using database query
  const { posts: categoryPosts } = await getAllPostsPhase3({ 
    status: 'published',
    categorySlug: slug,
    limit: 100 
  });
  
  // Get all published posts for popular posts
  const { posts: allPosts } = await getAllPostsPhase3({ 
    status: 'published',
    limit: 100 
  });
  
  // Get popular posts
  const popularPosts = allPosts.filter(p => p.isPopular).slice(0, 5);
  const categories = await getAllCategories();

  // Convert to PostData format
  const categoryPostsConverted = categoryPosts.map(convertPhase3PostToPostData);
  const popularPostsConverted = popularPosts.map(convertPhase3PostToPostData);

  return (
    <MainContainer>
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/blog' },
          { label: category.title },
        ]}
      />

      <header className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
          {category.title}
        </h1>
        {category.description && (
          <p className="text-text-secondary max-w-2xl">
            {category.description}
          </p>
        )}
        <p className="text-text-tertiary mt-2">
          {categoryPostsConverted.length} {categoryPostsConverted.length === 1 ? 'post' : 'posts'}
        </p>
      </header>

      {categoryPostsConverted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <PostGrid posts={categoryPostsConverted} columns={2} />
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
