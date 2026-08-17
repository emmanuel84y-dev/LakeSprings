'use client';

import { useState, useTransition } from 'react';
import { subscribeToNewsletter } from '@/lib/actions/newsletter';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeToNewsletter(email);
      setStatus(result.ok ? 'done' : 'error');
      if (result.ok) setEmail('');
    });
  }

  if (status === 'done') {
    return <p className="text-xs text-brass">You're subscribed — thank you.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Email address"
        className="w-44 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-brass focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brass px-3 py-2 text-xs font-medium text-white hover:bg-brass-dark disabled:opacity-50"
      >
        {pending ? 'Joining…' : 'Subscribe'}
      </button>
      {status === 'error' && <span className="text-xs text-red-300">Try again</span>}
    </form>
  );
}
