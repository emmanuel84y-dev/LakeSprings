import type { Metadata } from 'next';
import { CalendarX } from 'lucide-react';
import { getRooms } from '@/lib/data/rooms';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { EmptyState } from '@/components/ui/EmptyState';

export const metadata: Metadata = { title: 'Book Your Stay' };

interface SearchParams {
  room?: string;
  checkin?: string;
  checkout?: string;
  adults?: string;
  children?: string;
}

export default async function BookingPage({ searchParams }: { searchParams: SearchParams }) {
  const rooms = await getRooms({});

  return (
    <div className="container-lake py-10 md:py-16">
      <p className="eyebrow">Reserve</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Book Your Stay</h1>

      {rooms.length > 0 ? (
        <div className="mt-10">
          <BookingFlow
            rooms={rooms}
            initialRoomSlug={searchParams.room}
            initialCheckIn={searchParams.checkin}
            initialCheckOut={searchParams.checkout}
            initialAdults={searchParams.adults ? Number(searchParams.adults) : undefined}
            initialChildren={searchParams.children ? Number(searchParams.children) : undefined}
          />
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState icon={CalendarX} title="No rooms available to book" description="Please check back shortly, or contact us directly." />
        </div>
      )}
    </div>
  );
}
