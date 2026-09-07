import type { Metadata } from 'next';
import { getGallery } from '@/lib/data/content';
import { GalleryBrowser } from '@/components/gallery/GalleryBrowser';

export const metadata: Metadata = { title: 'Gallery' };

const validCategories = ['hotel', 'rooms', 'restaurant', 'pool', 'facilities', 'events', 'exterior'] as const;
type GalleryCategory = (typeof validCategories)[number];

type SearchParams = Promise<{ category?: string }> | { category?: string };

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedCategory = params.category;
  const initialCategory = validCategories.includes(requestedCategory as GalleryCategory)
    ? (requestedCategory as GalleryCategory)
    : 'all';
  const items = await getGallery();

  return (
    <div className="container-lake py-16">
      <p className="eyebrow">Gallery</p>
      <h1 className="mt-2 font-display text-4xl text-ink">A closer look at LakeSprings</h1>
      <GalleryBrowser items={items} initialCategory={initialCategory} />
    </div>
  );
}
