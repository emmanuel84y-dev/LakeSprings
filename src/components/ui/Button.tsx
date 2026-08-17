'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none overflow-hidden';

const variants: Record<Variant, string> = {
  primary: 'bg-brass text-white hover:bg-brass-dark shadow-card',
  outline: 'border border-reservoir text-reservoir hover:bg-reservoir hover:text-white',
  ghost: 'text-reservoir hover:bg-reservoir/5',
  dark: 'bg-reservoir text-white hover:bg-reservoir-900',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 rounded-md',
  md: 'text-sm px-6 py-3 rounded-md',
  lg: 'text-base px-8 py-4 rounded-md',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  ripple?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, ripple = true, children, onClick, ...props }, ref) => {
    const classes = cn(base, variants[variant], sizes[size], className);

    function handleClick(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
      if (ripple && variant === 'primary') {
        const target = e.currentTarget;
        const circle = document.createElement('span');
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        circle.style.width = circle.style.height = `${size}px`;
        circle.style.left = `${e.clientX - rect.left - size / 2}px`;
        circle.style.top = `${e.clientY - rect.top - size / 2}px`;
        circle.className = 'absolute rounded-full bg-white/40 animate-ripple pointer-events-none';
        target.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
      }
      // @ts-expect-error — shared handler across button/anchor
      onClick?.(e);
    }

    if (href) {
      return (
        <Link href={href} className={classes} onClick={handleClick as any}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
