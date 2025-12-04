import { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { NewPopularStrip } from '@/components/home/NewPopularStrip';
import { PostGrid } from '@/components/home/PostGrid';
import { Sidebar } from '@/components/sidebar/Sidebar';
import {
  getFeaturedPost,
  getPopularPosts,
  getNewPosts,
  getAllPosts,
  getCategories,
} from '@/lib/mockData';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Premium Skincare Reviews & Beauty Insights',
  description: 'Discover expert skincare reviews, beauty tips, and wellness insights. Blumea is your trusted source for luxury skincare content.',
  path: '/',
});

export default function HomePage() {
  const featuredPost = getFeaturedPost();
  const popularPosts = getPopularPosts(5);
  const newPosts = getNewPosts(5);
  const allPosts = getAllPosts();
  const categories = getCategories();

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Hero + Featured + Sidebar Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          {/* Hero Section - Left */}
          <div className="lg:col-span-4">
            <HeroSection
              title="The Radiance Edit: Augustinus Bader The Rich Cream"
              subtitle="Discover why this luxury cream has become a cult favorite. Our in-depth review reveals if it's worth the splurge."
              ctaLink={`/blog/${featuredPost.slug}`}
              ctaText="Read Review"
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
