import type { Metadata } from 'next';
import { CalendarSearch } from 'lucide-react';
import { getRooms, getRoomTypes } from '@/lib/data/rooms';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RoomFilters } from '@/components/rooms/RoomFilters';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Rooms & Suites',
  description: 'Browse LakeSprings Hotels rooms and suites, and check live availability for your dates.',
};

interface SearchParams {
  checkin?: string;
  checkout?: string;
  adults?: string;
  children?: string;
  type?: string;
  guests?: string;
  sort?: 'price_asc' | 'price_desc' | 'featured';
}

export default async function RoomsPage({ searchParams }: { searchParams: SearchParams }) {
  const [rooms, roomTypes] = await Promise.all([
    getRooms({
      checkin: searchParams.checkin,
      checkout: searchParams.checkout,
      guests: searchParams.guests ? Number(searchParams.guests) : searchParams.adults ? Number(searchParams.adults) + Number(searchParams.children ?? 0) : undefined,
      type: searchParams.type,
      sort: searchParams.sort,
    }),
    getRoomTypes(),
  ]);

  const isDateSearch = Boolean(searchParams.checkin && searchParams.checkout);

  return (
    <div className="container-lake py-16">
      <p className="eyebrow">Rooms &amp; Suites</p>
      <h1 className="mt-2 font-display text-4xl text-ink">
        {isDateSearch ? 'Available rooms for your dates' : 'Every room, at a glance'}
      </h1>

      {isDateSearch && (
        <p className="mt-2 flex items-center gap-2 text-sm text-ink/60">
          <CalendarSearch className="h-4 w-4" />
          {formatDate(searchParams.checkin!)} → {formatDate(searchParams.checkout!)}
        </p>
      )}

      <div className="mt-8">
        <RoomFilters roomTypes={roomTypes} />
      </div>

      {rooms.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            icon={CalendarSearch}
            title={isDateSearch ? 'No rooms are available for these dates' : 'No rooms match those filters'}
            description={
              isDateSearch
                ? 'Try adjusting your dates or guest count, or contact us directly — we may be able to help.'
                : 'Try widening your filters, or view every room.'
            }
          />
        </div>
      )}
    </div>
  );
}
