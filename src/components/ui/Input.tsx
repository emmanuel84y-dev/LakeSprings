import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-sand bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40',
        'focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass',
        'disabled:bg-mist disabled:text-ink/40',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
