import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MainContainer } from '@/components/layout/MainContainer';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { PostMeta } from '@/components/posts/PostMeta';
import { ReviewSummary } from '@/components/posts/ReviewSummary';
import { PostBodyRenderer } from '@/components/posts/PostBodyRenderer';
import { RelatedPosts } from '@/components/posts/RelatedPosts';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Pill } from '@/components/ui/Pill';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllPostsPhase3, getPostBySlugPhase3 } from '@/lib/db/repositories/posts';
import { getAllCategories } from '@/lib/db/repositories/categories';
import { generatePageMetadata, generateBlogPostSchema, generateReviewSchema } from '@/lib/seo';
import { getPlaceholderImage, convertPhase3PostToPostData } from '@/lib/utils';

// Make this page dynamic since it fetches from database
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch the post efficiently by slug
  const post = await getPostBySlugPhase3(slug, 'published');

  if (!post) {
    return generatePageMetadata({
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return generatePageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.images?.featured?.url || post.images?.card?.url,
    type: 'article',
    publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    modifiedTime: new Date(post.updatedAt).toISOString(),
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Fetch the post efficiently by slug
  const post = await getPostBySlugPhase3(slug, 'published');

  if (!post) {
    notFound();
  }

  // Get all published posts for popular and related
  const { posts: allPosts } = await getAllPostsPhase3({ status: 'published', limit: 100 });
  
  // Get popular posts and categories
  const popularPosts = allPosts.filter(p => p.isPopular).slice(0, 5);
  const categories = await getAllCategories();
  
  // Get related posts (same category, excluding current)
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.categorySlug === post.categorySlug)
    .slice(0, 3);

  const categoryTitle = post.categorySlug || 'Uncategorized';

  // Convert Phase 3 post structure to match expected types
  const overallRating = post.review?.overallRating;
  const criteriaRatings = post.review?.criteriaRatings;
  const pros = post.review?.pros;
  const cons = post.review?.cons;
  const verdict = post.review?.verdict;

  // Create schema-compatible post object
  const postForSchema = convertPhase3PostToPostData(post);

  const schema =
    post.postType === 'review'
      ? generateReviewSchema(postForSchema)
      : generateBlogPostSchema(postForSchema);
  
  // Convert posts for components
  const popularPostsConverted = popularPosts.map(convertPhase3PostToPostData);
  const relatedPostsConverted = relatedPosts.map(convertPhase3PostToPostData);

  return (
    <>
      <JsonLd data={schema} />
      
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-9">
            <Breadcrumbs
              items={[
                { label: post.postType === 'review' ? 'Reviews' : 'Blog', href: post.postType === 'review' ? '/reviews' : '/blog' },
                { label: categoryTitle, href: `/category/${post.categorySlug}` },
                { label: post.title },
              ]}
            />

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Pill variant="accent">{categoryTitle}</Pill>
                {post.postType === 'review' && (
                  <Pill variant="muted">Review</Pill>
                )}
              </div>

              <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-semibold text-text-primary mb-6">
                {post.title}
              </h1>

              <PostMeta
                publishedAt={post.publishedAt || post.createdAt}
                readingTime={post.wordCount ? Math.ceil(post.wordCount / 200) : undefined}
                authorName={post.createdBy}
                rating={overallRating}
                showRating={post.postType === 'review'}
              />
            </header>

            {/* Cover Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={post.images?.featured?.url || post.images?.card?.url || getPlaceholderImage(1200, 675)}
                alt={post.images?.featured?.alt || post.images?.card?.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Review Summary (if review) */}
            {post.postType === 'review' && overallRating && (
              <div className="mb-8">
                <ReviewSummary
                  overallRating={overallRating}
                  criteriaRatings={criteriaRatings}
                  pros={pros}
                  cons={cons}
                  verdict={verdict}
                />
              </div>
            )}

            {/* Body Content */}
            <div className="mb-12">
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <PostBodyRenderer content={post.bodyRaw} />
            </div>

            {/* Related Posts */}
            {relatedPostsConverted.length > 0 && (
              <RelatedPosts posts={relatedPostsConverted} />
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <Sidebar
                popularPosts={popularPostsConverted}
                categories={categories}
              />
            </div>
          </aside>
        </div>
      </MainContainer>
    </>
  );
}
