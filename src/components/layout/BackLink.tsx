'use client';

import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackLink({ href, label = 'Back', className = '' }: BackLinkProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-brass ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </a>
  );
}
