'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to your monitoring provider of choice — never shown to guests.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-mist px-6 text-center">
      <AlertTriangle className="h-10 w-10 text-brass" strokeWidth={1.5} />
      <h1 className="mt-4 font-display text-3xl text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-ink/60">
        We hit an unexpected error on our end. Please try again, or contact us if the problem continues.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="outline">Try Again</Button>
        <Button href="/">Back to Home</Button>
      </div>
    </div>
  );
}
