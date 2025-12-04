import { Metadata } from 'next';
import { MainContainer } from '@/components/layout/MainContainer';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { generatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = generatePageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy for Blumea - Learn how we collect, use, and protect your personal information.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <MainContainer>
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <article className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="font-heading text-3xl lg:text-4xl font-semibold text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="text-text-secondary">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
              Introduction
            </h2>
            <p className="text-text-secondary leading-relaxed">
              At Blumea (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website blumea.me.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
              Information We Collect
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We may collect information about you in various ways:
            </p>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span><strong>Personal Data:</strong> Email address and name when you subscribe to our newsletter or contact us.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span><strong>Usage Data:</strong> Information about how you use our website, including pages visited and time spent.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span><strong>Cookies:</strong> Small files stored on your device to improve your browsing experience.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
              How We Use Your Information
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>To provide and maintain our website</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>To send you newsletters and marketing communications (with your consent)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>To respond to your inquiries and support requests</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>To analyze and improve our website&apos;s performance</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
              Data Protection
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
              Your Rights
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Access your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Request correction of your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Request deletion of your personal data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent">•</span>
                <span>Unsubscribe from our newsletter at any time</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">
              Contact Us
            </h2>
            <p className="text-text-secondary leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a
                href="mailto:privacy@blumea.me"
                className="text-accent hover:text-accent-hover transition-colors"
              >
                privacy@blumea.me
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </MainContainer>
  );
}
