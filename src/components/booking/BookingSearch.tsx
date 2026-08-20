'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DateInput } from '@/components/ui/DateInput';

const todayISO = () => new Date().toISOString().split('T')[0];
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export function BookingSearch({ roomTypes, compact }: { roomTypes: string[]; compact?: boolean }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(tomorrowISO());
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [roomType, setRoomType] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      checkin: checkIn,
      checkout: checkOut,
      adults: String(adults),
      children: String(children),
      rooms: String(rooms),
    });
    if (roomType) params.set('type', roomType);
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-4' : ''}>
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-6'}`}>
        <Field label="Check-in" icon={CalendarDays}>
          <DateInput id="checkin" required value={checkIn} min={todayISO()} onChange={setCheckIn} />
        </Field>

        <Field label="Check-out" icon={CalendarDays}>
          <DateInput id="checkout" required value={checkOut} min={checkIn} onChange={setCheckOut} />
        </Field>

        <Field label="Adults" icon={Users}>
          <input
            type="number"
            min={1}
            max={20}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full bg-transparent text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="Children" icon={Users}>
          <input
            type="number"
            min={0}
            max={20}
            value={children}
            onChange={(e) => setChildren(Number(e.target.value))}
            className="w-full bg-transparent text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="Rooms">
          <input
            type="number"
            min={1}
            max={10}
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full bg-transparent text-sm text-ink focus:outline-none"
          />
        </Field>

        <Field label="Room type">
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none"
          >
            <option value="">Any</option>
            {roomTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      {rooms > 1 && (
        <p className="mt-2 text-xs text-ink/50">
          Booking multiple rooms together? We&apos;ll show single-room availability below —{' '}
          <a href="/contact" className="text-brass underline">contact us</a> to arrange a group booking.
        </p>
      )}

      <Button type="submit" size="lg" className="mt-4 w-full justify-center gap-2 lg:w-auto">
        <Search className="h-4 w-4" /> Check Availability
      </Button>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-md border border-sand px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink/50">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </span>
      {children}
    </label>
  );
}
