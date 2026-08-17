import { cn } from '@/lib/utils';

const tones: Record<string, string> = {
  neutral: 'bg-sand/60 text-ink',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  brass: 'bg-brass/15 text-brass-dark',
};

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize', tones[tone])}>
      {children}
    </span>
  );
}
