import { Metadata } from 'next';
import Image from 'next/image';
import { MainContainer } from '@/components/layout/MainContainer';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { generatePageMetadata } from '@/lib/seo';
import { getPlaceholderImage } from '@/lib/utils';

export const metadata: Metadata = generatePageMetadata({
  title: 'About Us',
  description: 'Learn about Blumea - your trusted source for premium skincare reviews, beauty tips, and wellness insights.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <MainContainer>
      <Breadcrumbs items={[{ label: 'About' }]} />

      <article className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-semibold text-text-primary mb-6">
            About Blumea
          </h1>
          <p className="text-text-secondary text-lg">
            Your trusted guide to radiant skin and mindful beauty
          </p>
        </header>

        <div className="relative aspect-video rounded-xl overflow-hidden mb-12">
          <Image
            src={getPlaceholderImage(1200, 675)}
            alt="About Blumea"
            fill
            className="object-cover"
          />
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
              Our Story
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Blumea was born from a passion for skincare and a desire to cut through the noise of the beauty industry. We believe that everyone deserves access to honest, well-researched information about the products they put on their skin.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Our team of beauty editors and skincare enthusiasts rigorously tests every product we review, spending weeks with each item to ensure our recommendations are genuinely helpful.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
              Our Mission
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We&apos;re committed to providing honest, in-depth skincare reviews and beauty insights that help you make informed decisions. No sponsored content influences our reviews—we tell you exactly what we think, whether it&apos;s a $10 drugstore find or a $300 luxury cream.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
              What Sets Us Apart
            </h2>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Rigorous testing protocols for every product we review</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Science-backed skincare advice and ingredient analysis</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Honest opinions, free from sponsored bias</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Coverage of both luxury and accessible skincare options</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold text-text-primary mb-4">
              Join Our Community
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Subscribe to our newsletter to receive the latest reviews, skincare tips, and exclusive content directly in your inbox. Together, let&apos;s discover the products that truly work.
            </p>
          </section>
        </div>
      </article>
    </MainContainer>
  );
}
