import Image from 'next/image';
import Link from 'next/link';
import { Users, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, resolveImageUrl } from '@/lib/utils';
import type { RoomWithImages } from '@/types/database';

export function RoomCard({ room }: { room: RoomWithImages }) {
  const primary = room.room_images.find((i) => i.is_primary) ?? room.room_images[0];

  return (
    <div className="group overflow-hidden rounded-xl border border-sand bg-white transition-shadow hover:shadow-card">
      <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        {primary ? (
          <Image
            src={resolveImageUrl(primary.storage_path, 'room-images')}
            alt={primary.alt_text || room.name}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-mist text-sm text-ink/40">No image yet</div>
        )}
        {room.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brass px-3 py-1 text-xs font-medium text-white">
            Featured
          </span>
        )}
      </Link>

      <div className="p-5">
        <p className="eyebrow">{room.room_type}</p>
        <h3 className="mt-1 font-display text-xl text-ink">
          <Link href={`/rooms/${room.slug}`} className="hover:text-brass">{room.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink/60">{room.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-ink/50">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {room.max_guests} guests</span>
          {room.bed_type && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {room.bed_type}</span>}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-sand pt-4">
          <div>
            <span className="font-display text-lg text-ink tabular-nums">{formatCurrency(room.price_per_night)}</span>
            <span className="text-xs text-ink/50"> / night</span>
          </div>
          <div className="flex gap-2">
            <Button href={`/rooms/${room.slug}`} size="sm" variant="ghost">View</Button>
            <Button href={`/booking?room=${room.slug}`} size="sm">Book Now</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
