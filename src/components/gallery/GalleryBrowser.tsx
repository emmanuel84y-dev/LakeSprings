'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Images } from 'lucide-react';
import type { GalleryItem, GalleryCategory } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';
import { resolveImageUrl } from '@/lib/utils';

const categories: { value: 'all' | GalleryCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'pool', label: 'Pool' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'events', label: 'Events' },
  { value: 'exterior', label: 'Exterior' },
];

export function GalleryBrowser({ items, initialCategory = 'all' }: { items: GalleryItem[]; initialCategory?: 'all' | GalleryCategory }) {
  const [category, setCategory] = useState<'all' | GalleryCategory>(initialCategory);

  const filteredItems = useMemo(
    () => (category === 'all' ? items : items.filter((item) => item.category === category)),
    [category, items],
  );

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${category === item.value ? 'bg-reservoir text-white' : 'bg-mist text-ink/60 hover:bg-sand hover:text-ink'}`}
            aria-pressed={category === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg break-inside-avoid">
              <Image
                src={resolveImageUrl(item.storage_path, 'gallery-images')}
                alt={item.caption ?? `${item.category} at LakeSprings Hotels`}
                width={600}
                height={800}
                className="w-full object-cover"
              />
              {item.caption && (
                <p className="absolute bottom-0 w-full bg-gradient-to-t from-reservoir-900/80 to-transparent p-3 text-xs text-white">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState icon={Images} title="No gallery images yet" description="Photos will appear here once the hotel team uploads them from the admin dashboard." />
        </div>
      )}
    </>
  );
}
