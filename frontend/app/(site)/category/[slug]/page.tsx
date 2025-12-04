import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getPostsByCategory, getPopularPosts, getCategories } from '@/lib/mockData';
import { generatePageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = getCategories();
  const category = categories.find((c) => c.slug === slug);

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

export async function generateStaticParams() {
  const categories = getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const posts = getPostsByCategory(slug);
  const popularPosts = getPopularPosts(5);

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
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          <PostGrid posts={posts} columns={2} />
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
