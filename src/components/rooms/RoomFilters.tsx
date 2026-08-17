'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Select } from '@/components/ui/Select';

export function RoomFilters({ roomTypes }: { roomTypes: string[] }) {
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
      <Select
        className="w-auto"
        value={searchParams.get('type') ?? ''}
        onChange={(e) => update('type', e.target.value)}
        aria-label="Filter by room type"
      >
        <option value="">All room types</option>
        {roomTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </Select>

      <Select
        className="w-auto"
        value={searchParams.get('guests') ?? ''}
        onChange={(e) => update('guests', e.target.value)}
        aria-label="Filter by guest capacity"
      >
        <option value="">Any capacity</option>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>{n}+ guests</option>
        ))}
      </Select>

      <Select
        className="w-auto"
        value={searchParams.get('sort') ?? 'featured'}
        onChange={(e) => update('sort', e.target.value)}
        aria-label="Sort rooms"
      >
        <option value="featured">Featured</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
      </Select>

      {(searchParams.get('checkin') || searchParams.get('type') || searchParams.get('guests')) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-ink/50 underline hover:text-ink"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
