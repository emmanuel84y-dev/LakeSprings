import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-md border border-sand bg-white px-4 py-3 text-sm text-ink',
        'focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
