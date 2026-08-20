import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Users, BedDouble, Ruler, Layers, Check } from 'lucide-react';
import { getRoomBySlug } from '@/lib/data/rooms';
import { RoomGallery } from '@/components/rooms/RoomGallery';
import { RoomAvailabilityWidget } from '@/components/booking/RoomAvailabilityWidget';
import { BackLink } from '@/components/layout/BackLink';
import { formatCurrency } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const room = await getRoomBySlug(params.slug);
  if (!room) return {};
  return {
    title: room.name,
    description: room.description.slice(0, 155),
    openGraph: {
      title: room.name,
      description: room.description.slice(0, 155),
      images: room.room_images[0] ? [room.room_images[0].storage_path] : undefined,
    },
  };
}

export default async function RoomDetailPage({ params }: { params: { slug: string } }) {
  const room = await getRoomBySlug(params.slug);
  if (!room) notFound();

  return (
    <div className="container-lake py-10 md:py-16">
      <BackLink href="/rooms" className="mb-6" />
      <p className="eyebrow">{room.room_type}</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{room.name}</h1>

      <div className="mt-8">
        <RoomGallery images={room.room_images} roomName={room.name} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-6 border-b border-sand pb-6 text-sm text-ink/70">
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brass" /> Up to {room.max_guests} guests</span>
            {room.bed_type && <span className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-brass" /> {room.bed_type}</span>}
            {room.size_sqm && <span className="flex items-center gap-2"><Ruler className="h-4 w-4 text-brass" /> {room.size_sqm} m²</span>}
            {room.floor && <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-brass" /> {room.floor}</span>}
          </div>

          <div className="mt-6">
            <h2 className="font-display text-2xl text-ink">About this room</h2>
            <p className="mt-3 leading-relaxed text-ink/70">{room.description}</p>
          </div>

          {room.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-2xl text-ink">Amenities</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {room.amenities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm text-ink/70">
                    <Check className="h-4 w-4 shrink-0 text-brass" /> {a.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-sm text-ink/50">
            Rate shown is per night in {formatCurrency(0).replace(/[\d.,]/g, '').trim() || 'NGN'}, before any applicable discounts or fees, and is calculated automatically from the dates you select.
          </p>
        </div>

        <div>
          <RoomAvailabilityWidget
            roomId={room.id}
            slug={room.slug}
            pricePerNight={room.price_per_night}
            maxGuests={room.max_guests}
          />
        </div>
      </div>
    </div>
  );
}
