import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { NewPopularStrip } from '@/components/home/NewPopularStrip';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { getPostsForHome } from '@/lib/db/repositories/posts';
import { getAllCategories } from '@/lib/db/repositories/categories';
import { generatePageMetadata } from '@/lib/seo';
import { convertPhase3PostToPostData } from '@/lib/utils';

export const metadata: Metadata = generatePageMetadata({
  title: 'Premium Skincare Reviews & Beauty Insights',
  description: 'Discover expert skincare reviews, beauty tips, and wellness insights. Blumea is your trusted source for luxury skincare content.',
  path: '/',
});

export default async function HomePage() {
  // Fetch data from database
  const { featured, popular, new: newPosts } = await getPostsForHome();
  const categories = await getAllCategories();
  
  // Get featured post or fallback to first new post
  const featuredPostRaw = featured.length > 0 ? featured[0] : newPosts.length > 0 ? newPosts[0] : null;
  
  // Convert to PostData format
  const featuredPost = featuredPostRaw ? convertPhase3PostToPostData(featuredPostRaw) : null;
  const popularPostsConverted = popular.map(convertPhase3PostToPostData);
  const newPostsConverted = newPosts.map(convertPhase3PostToPostData);
  
  // Get all posts for the main grid (combine and dedupe)
  const allPostsMap = new Map();
  [...featured, ...popular, ...newPosts].forEach(post => {
    const id = post._id?.toString();
    if (id) {
      allPostsMap.set(id, post);
    }
  });
  const allPosts = Array.from(allPostsMap.values()).map(convertPhase3PostToPostData);

  // Handle empty database state
  if (!featuredPost) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
              No posts available yet
            </h2>
            <p className="text-text-secondary">
              Check back soon for amazing skincare content!
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero + Featured + Sidebar Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          {/* Hero Section - Left */}
          <div className="lg:col-span-4">
            <HeroSection
              title={featuredPost.title}
              subtitle={featuredPost.excerpt}
              ctaLink={`/blog/${featuredPost.slug}`}
              ctaText="Read More"
            />
          </div>

          {/* Featured Card - Center */}
          <div className="lg:col-span-5">
            <FeaturedCard post={featuredPost} />
          </div>

          {/* Sidebar - Right */}
          <div className="lg:col-span-3">
            <Sidebar
              popularPosts={popularPostsConverted.slice(0, 3)}
              categories={categories}
            />
          </div>
        </section>

        {/* New/Popular Strip */}
        <NewPopularStrip newPosts={newPostsConverted} popularPosts={popularPostsConverted} />

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Post Grid */}
          <div className="lg:col-span-9">
            <PostGrid posts={allPosts} title="Latest Articles" />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <Sidebar
              popularPosts={popularPostsConverted}
              categories={categories}
              showSearch={false}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
