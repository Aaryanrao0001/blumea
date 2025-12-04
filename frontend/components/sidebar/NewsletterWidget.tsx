'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setStatus('loading');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary rounded-lg p-6 border border-accent/20">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-lg font-semibold text-text-primary">
          Newsletter
        </h3>
      </div>
      
      <p className="text-text-secondary text-sm mb-4">
        Get the latest skincare tips and exclusive reviews delivered to your inbox.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </Button>
          {status === 'error' && (
            <p className="text-error text-sm">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}

export default NewsletterWidget;
