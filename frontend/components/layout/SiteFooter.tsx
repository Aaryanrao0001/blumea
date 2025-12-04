import Link from 'next/link';
import { Mail, Instagram, Twitter, Youtube } from 'lucide-react';

const footerLinks = {
  explore: [
    { href: '/', label: 'Home' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/contact', label: 'Contact' },
  ],
  categories: [
    { href: '/category/skincare', label: 'Skincare' },
    { href: '/category/wellness', label: 'Wellness' },
    { href: '/category/reviews', label: 'Reviews' },
  ],
};

const socialLinks = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
];

export function SiteFooter() {
  return (
    <footer className="bg-bg-secondary border-t border-border-subtle">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-2xl font-semibold text-text-primary">
                Blumea
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Premium skincare reviews, beauty tips, and wellness insights.
              Discover your radiance with expert-curated content.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tertiary hover:text-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-secondary hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Stay Updated
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              Subscribe to our newsletter for the latest reviews and tips.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-bg-tertiary border border-border-subtle rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="bg-accent text-bg-primary px-4 py-2 rounded text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-tertiary text-sm">
            © {new Date().getFullYear()} Blumea. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-text-tertiary hover:text-accent transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
