'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackLink({ href, label = 'Back', className = '' }: { href: string; label?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-brass ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
