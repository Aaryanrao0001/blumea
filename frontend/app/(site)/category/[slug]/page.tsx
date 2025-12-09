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
import { PostData, CategoryData } from '@/lib/types';

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
  
  let categoryPosts: PostData[] = [];
  let popularPosts: PostData[] = [];
  let categories: CategoryData[] = [];
  let error: string | null = null;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  try {
    // Fetch posts for this category efficiently using database query
    const { posts: categoryPostsRaw } = await getAllPostsPhase3({ 
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
    const popularPostsRaw = allPosts.filter(p => p.isPopular).slice(0, 5);
    categories = await getAllCategories();

    // Convert to PostData format
    categoryPosts = categoryPostsRaw.map(convertPhase3PostToPostData);
    popularPosts = popularPostsRaw.map(convertPhase3PostToPostData);
  } catch (err) {
    console.error('Error loading category page:', err);
    error = 'Unable to load category posts. Please try again later.';
  }

  if (error) {
    return (
      <MainContainer>
        <Breadcrumbs
          items={[
            { label: 'Categories', href: '/blog' },
            { label: category.title },
          ]}
        />
        <div className="text-center py-12">
          <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
            Something went wrong
          </h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </MainContainer>
    );
  }

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
          {categoryPosts.length} {categoryPosts.length === 1 ? 'post' : 'posts'}
        </p>
      </header>

      {categoryPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <PostGrid posts={categoryPosts} columns={2} />
          </div>
          <aside className="lg:col-span-3">
            <Sidebar
              popularPosts={popularPosts}
              categories={categories}
            />
          </aside>
        </div>
      )}
    </MainContainer>
  );
}
