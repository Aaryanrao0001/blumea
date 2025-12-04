import { Metadata } from 'next';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getAllPosts, getPopularPosts, getCategories } from '@/lib/mockData';
import { generatePageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ');

  return generatePageMetadata({
    title: `Posts tagged "${tagName}"`,
    description: `Browse all posts tagged with ${tagName}`,
    path: `/tag/${slug}`,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ');
  
  // For now, return all posts (in production, filter by tag)
  const posts = getAllPosts().slice(0, 4);
  const popularPosts = getPopularPosts(5);
  const categories = getCategories();

  return (
    <MainContainer>
      <Breadcrumbs
        items={[
          { label: 'Tags', href: '/blog' },
          { label: tagName },
        ]}
      />

      <header className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
          Posts tagged &ldquo;{tagName}&rdquo;
        </h1>
        <p className="text-text-tertiary">
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
