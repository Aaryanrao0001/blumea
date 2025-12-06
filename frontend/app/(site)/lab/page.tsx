import { Metadata } from 'next';
import { MainContainer } from '@/components/layout/MainContainer';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { getLabPosts } from '@/lib/db/repositories/posts';
import { getPopularPosts, getCategories } from '@/lib/mockData';
import { generatePageMetadata } from '@/lib/seo';
import { PostData } from '@/lib/types';

export const metadata: Metadata = generatePageMetadata({
  title: 'AI Lab - Experimental Content',
  description: 'Explore AI-generated content in our experimental lab. This content is in testing and may not be final.',
  path: '/lab',
  noIndex: true, // Prevent indexing of lab content
});

export default async function LabPage() {
  let labPosts: PostData[] = [];
  
  try {
    const { posts } = await getLabPosts({ limit: 20 });
    // Convert to PostData format for compatibility with existing components
    labPosts = posts.map((post) => ({
      _id: post._id,
      title: post.title,
      slug: post.slug,
      type: post.postType,
      excerpt: post.excerpt,
      body: post.bodyRaw,
      coverImage: post.images.card || post.images.featured || { url: '', alt: post.title },
      category: { _id: '', title: post.categorySlug, slug: post.categorySlug },
      tags: post.tagSlugs.map((slug) => ({ _id: '', title: slug, slug })),
      author: { _id: '', name: 'AI Assistant', slug: 'ai-assistant' },
      publishedAt: post.createdAt,
      updatedAt: post.updatedAt,
      isFeatured: false,
      isPopular: false,
      readingTime: Math.ceil(post.wordCount / 200),
      overallRating: post.review?.overallRating,
      pros: post.review?.pros,
      cons: post.review?.cons,
      verdict: post.review?.verdict,
    })) as PostData[];
  } catch (error) {
    console.error('Error fetching lab posts:', error);
    // Return empty array if there's an error
  }

  const popularPosts = getPopularPosts(5);
  const categories = getCategories();

  return (
    <MainContainer>
      <Breadcrumbs items={[{ label: 'AI Lab' }]} />
      
      {/* Disclaimer Banner */}
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">
              Experimental AI Content Lab
            </h2>
            <p className="text-text-secondary mb-2">
              Welcome to our AI Lab! This is where we test and refine AI-generated content before it goes live.
              Content here is experimental and may contain inaccuracies or incomplete information.
            </p>
            <p className="text-text-tertiary text-sm">
              <strong>Note:</strong> Lab content is not final and should not be considered professional advice.
              All posts are carefully reviewed before being published to our main site.
            </p>
          </div>
        </div>
      </div>

      <header className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
          AI Lab
        </h1>
        <p className="text-text-secondary max-w-2xl">
          Explore AI-generated skincare content in development. Help us improve by providing feedback on these experimental posts.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9">
          {labPosts.length > 0 ? (
            <PostGrid posts={labPosts} columns={2} />
          ) : (
            <div className="bg-bg-secondary rounded-lg p-12 text-center">
              <p className="text-text-secondary">No experimental content available at the moment.</p>
              <p className="text-text-tertiary text-sm mt-2">Check back soon for new AI-generated posts!</p>
            </div>
          )}
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
