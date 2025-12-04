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
import { getPostBySlug, getAllPosts, getPopularPosts, getCategories } from '@/lib/mockData';
import { generatePageMetadata, generateBlogPostSchema, generateReviewSchema } from '@/lib/seo';
import { getPlaceholderImage } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

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
    image: post.coverImage?.url,
    type: 'article',
    publishedTime: new Date(post.publishedAt).toISOString(),
    modifiedTime: new Date(post.updatedAt).toISOString(),
    author: typeof post.author === 'object' ? post.author.name : undefined,
  });
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const popularPosts = getPopularPosts(5);
  const categories = getCategories();
  
  // Get related posts (same category, excluding current)
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        typeof p.category === 'object' &&
        typeof post.category === 'object' &&
        p.category.slug === post.category.slug
    )
    .slice(0, 3);

  const categoryTitle =
    typeof post.category === 'object' && 'title' in post.category
      ? post.category.title
      : 'Uncategorized';

  const categorySlug =
    typeof post.category === 'object' && 'slug' in post.category
      ? post.category.slug
      : '';

  const authorName =
    typeof post.author === 'object' && 'name' in post.author
      ? post.author.name
      : 'Unknown';

  const schema =
    post.type === 'review'
      ? generateReviewSchema(post)
      : generateBlogPostSchema(post);

  return (
    <>
      <JsonLd data={schema} />
      
      <MainContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-9">
            <Breadcrumbs
              items={[
                { label: post.type === 'review' ? 'Reviews' : 'Blog', href: post.type === 'review' ? '/reviews' : '/blog' },
                { label: categoryTitle, href: `/category/${categorySlug}` },
                { label: post.title },
              ]}
            />

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Pill variant="accent">{categoryTitle}</Pill>
                {post.type === 'review' && (
                  <Pill variant="muted">Review</Pill>
                )}
              </div>

              <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-semibold text-text-primary mb-6">
                {post.title}
              </h1>

              <PostMeta
                publishedAt={post.publishedAt}
                readingTime={post.readingTime}
                authorName={authorName}
                rating={post.overallRating}
                showRating={post.type === 'review'}
              />
            </header>

            {/* Cover Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              <Image
                src={post.coverImage?.url || getPlaceholderImage(1200, 675)}
                alt={post.coverImage?.alt || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Review Summary (if review) */}
            {post.type === 'review' && post.overallRating && (
              <div className="mb-8">
                <ReviewSummary
                  overallRating={post.overallRating}
                  criteriaRatings={post.criteriaRatings}
                  pros={post.pros}
                  cons={post.cons}
                  verdict={post.verdict}
                />
              </div>
            )}

            {/* Body Content */}
            <div className="mb-12">
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <PostBodyRenderer content={post.body} />
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} />
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <Sidebar
                popularPosts={popularPosts}
                categories={categories}
              />
            </div>
          </aside>
        </div>
      </MainContainer>
    </>
  );
}
