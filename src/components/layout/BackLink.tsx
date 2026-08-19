'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackLink({ href = '', label = 'Back', className = '' }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <a
      href={href || '#'}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-brass ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </a>
  );
}
