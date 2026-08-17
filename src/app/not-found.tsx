import Link from 'next/link';
import { Waves } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-mist px-6 text-center">
      <Waves className="h-10 w-10 text-brass" strokeWidth={1.5} />
      <h1 className="mt-4 font-display text-4xl text-ink">Page not found</h1>
      <p className="mt-2 max-w-sm text-ink/60">
        The page you're looking for may have moved, or the room you searched for may no longer be listed.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/" variant="outline">Back to Home</Button>
        <Button href="/rooms">Browse Rooms</Button>
      </div>
    </div>
  );
}
