'use client';

import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function BackLink({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/') return null;

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-brass ${className}`}
      aria-label="Go back to the previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
