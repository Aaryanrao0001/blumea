import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { NewPopularStrip } from '@/components/home/NewPopularStrip';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { getPostsForHome } from '@/lib/db/repositories/posts';
import { getAllCategories } from '@/lib/db/repositories/categories';
import { generatePageMetadata } from '@/lib/seo';
import { convertPhase3PostToPostData, serializePost } from '@/lib/utils';
import { PostData, CategoryData } from '@/lib/types';

export const metadata: Metadata = generatePageMetadata({
  title: 'Premium Skincare Reviews & Beauty Insights',
  description: 'Discover expert skincare reviews, beauty tips, and wellness insights. Blumea is your trusted source for luxury skincare content.',
  path: '/',
});

export default async function HomePage() {
  let featuredPost: PostData | null = null;
  let popularPosts: PostData[] = [];
  let newPosts: PostData[] = [];
  let categories: CategoryData[] = [];
  let allPosts: PostData[] = [];
  let error: string | null = null;

  try {
    const { featured, popular, new: newPostsData } = await getPostsForHome();
    categories = await getAllCategories();
    
    const featuredPostRaw = featured.length > 0 ? featured[0] : newPostsData.length > 0 ? newPostsData[0] : null;
    
    featuredPost = featuredPostRaw ? serializePost(convertPhase3PostToPostData(featuredPostRaw)) : null;
    popularPosts = popular.map(p => serializePost(convertPhase3PostToPostData(p)));
    newPosts = newPostsData.map(p => serializePost(convertPhase3PostToPostData(p)));
    
    const allPostsMap = new Map();
    [...featured, ...popular, ...newPostsData].forEach(post => {
      const id = post._id?.toString();
      if (id) {
        allPostsMap.set(id, post);
      }
    });
    allPosts = Array.from(allPostsMap.values()).map(p => serializePost(convertPhase3PostToPostData(p)));
  } catch (err) {
    console.error('Error loading homepage data:', err);
    error = 'Unable to load content. Please try again later.';
  }

  if (error) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center py-12">
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
              Something went wrong
            </h2>
            <p className="text-text-secondary">{error}</p>
          </div>
        </div>
      </main>
    );
  }

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
              popularPosts={popularPosts.slice(0, 3)}
              categories={categories}
            />
          </div>
        </section>

        {/* New/Popular Strip */}
        <NewPopularStrip newPosts={newPosts} popularPosts={popularPosts} />

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Post Grid */}
          <div className="lg:col-span-9">
            <PostGrid posts={allPosts} title="Latest Articles" />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <Sidebar
              popularPosts={popularPosts}
              categories={categories}
              showSearch={false}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
