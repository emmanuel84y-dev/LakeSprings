import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'brass' | 'warning';
}) {
  return (
    <div className="rounded-xl border border-sand bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/50">{label}</p>
        <Icon
          className={cn(
            'h-4 w-4',
            tone === 'brass' && 'text-brass',
            tone === 'warning' && 'text-amber-500',
            tone === 'default' && 'text-still'
          )}
        />
      </div>
      <p className="mt-2 font-display text-3xl text-ink tabular-nums">{value}</p>
    </div>
  );
}
