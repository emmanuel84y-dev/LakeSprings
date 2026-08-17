'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Select } from '@/components/ui/Select';

const statuses = ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'completed', 'no_show'];

export function BookingSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
        <input
          defaultValue={searchParams.get('q') ?? ''}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Search name, email, or reference…"
          className="w-full rounded-md border border-sand bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
        />
      </div>
      <Select className="w-auto" value={searchParams.get('status') ?? ''} onChange={(e) => update('status', e.target.value)}>
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </Select>
    </div>
  );
}
