import type { Metadata } from 'next';
import Image from 'next/image';
import { Images } from 'lucide-react';
import { getGallery } from '@/lib/data/content';
import { EmptyState } from '@/components/ui/EmptyState';
import { resolveImageUrl } from '@/lib/utils';

export const metadata: Metadata = { title: 'Gallery' };

const categories = ['hotel', 'rooms', 'restaurant', 'pool', 'facilities', 'events', 'exterior'];

export default async function GalleryPage({ searchParams }: { searchParams: { category?: string } }) {
  const items = await getGallery(searchParams.category);

  return (
    <div className="container-lake py-16">
      <p className="eyebrow">Gallery</p>
      <h1 className="mt-2 font-display text-4xl text-ink">A closer look at LakeSprings</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <a href="/gallery" className={`rounded-full px-3 py-1.5 text-sm ${!searchParams.category ? 'bg-reservoir text-white' : 'bg-mist text-ink/60'}`}>All</a>
        {categories.map((c) => (
          <a key={c} href={`/gallery?category=${c}`} className={`rounded-full px-3 py-1.5 text-sm capitalize ${searchParams.category === c ? 'bg-reservoir text-white' : 'bg-mist text-ink/60'}`}>
            {c}
          </a>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {items.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg break-inside-avoid">
              <Image
                src={resolveImageUrl(item.storage_path, 'gallery-images')}
                alt={item.caption ?? ''}
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
    </div>
  );
}
