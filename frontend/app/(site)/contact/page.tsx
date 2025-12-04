'use client';

import { useState } from 'react';
import { Mail, MapPin, Clock, Send, Loader2 } from 'lucide-react';
import { MainContainer } from '@/components/layout/MainContainer';
import { Breadcrumbs } from '@/components/posts/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <MainContainer>
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-semibold text-text-primary mb-6">
            Get in Touch
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Have a question, suggestion, or want to collaborate? We&apos;d love to hear from you.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">Email</p>
                    <a
                      href="mailto:hello@blumea.me"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      hello@blumea.me
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">Location</p>
                    <p className="text-text-secondary">Remote-first team, worldwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-bg-secondary rounded-lg">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">Response Time</p>
                    <p className="text-text-secondary">Within 24-48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-bg-secondary rounded-lg border border-border-subtle">
              <h3 className="font-heading text-lg font-semibold text-text-primary mb-3">
                Press & Partnerships
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                For press inquiries, brand partnerships, or collaboration opportunities, please reach out to us directly.
              </p>
              <a
                href="mailto:partnerships@blumea.me"
                className="text-accent hover:text-accent-hover transition-colors text-sm"
              >
                partnerships@blumea.me
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-bg-secondary rounded-lg p-6 border border-border-subtle">
            <h2 className="font-heading text-xl font-semibold text-text-primary mb-6">
              Send a Message
            </h2>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-text-primary font-semibold mb-2">
                  Message Sent!
                </h3>
                <p className="text-text-secondary text-sm">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-text-secondary text-sm mb-2"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-text-secondary text-sm mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-text-secondary text-sm mb-2"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-text-secondary text-sm mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    className="w-full bg-bg-tertiary border border-border-subtle rounded-md px-4 py-2.5 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainContainer>
  );
}
