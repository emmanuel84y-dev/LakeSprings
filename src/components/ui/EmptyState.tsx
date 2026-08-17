import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-sand py-16 text-center">
      <Icon className="h-8 w-8 text-still/50" strokeWidth={1.5} />
      <p className="font-display text-lg text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink/60">{description}</p>
      {action}
    </div>
  );
}
