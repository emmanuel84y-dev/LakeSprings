import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-md border border-sand bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40',
        'focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
