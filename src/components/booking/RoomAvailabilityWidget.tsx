'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency, nightsBetween } from '@/lib/utils';
import { checkRoomAvailability } from '@/lib/actions/booking';

const todayISO = () => new Date().toISOString().split('T')[0];
const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export function RoomAvailabilityWidget({
  roomId,
  slug,
  pricePerNight,
  maxGuests,
}: {
  roomId: string;
  slug: string;
  pricePerNight: number;
  maxGuests: number;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(tomorrowISO());
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [availability, setAvailability] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
  const [pending, startTransition] = useTransition();

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * pricePerNight;
  const overCapacity = adults + children > maxGuests;

  function handleCheck() {
    setAvailability('unknown');
    startTransition(async () => {
      const ok = await checkRoomAvailability(roomId, checkIn, checkOut);
      setAvailability(ok ? 'available' : 'unavailable');
    });
  }

  function handleReserve() {
    const params = new URLSearchParams({
      room: slug,
      checkin: checkIn,
      checkout: checkOut,
      adults: String(adults),
      children: String(children),
    });
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <div className="sticky top-24 rounded-xl border border-sand bg-white p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl tabular-nums text-ink">{formatCurrency(pricePerNight)}</span>
        <span className="text-sm text-ink/50">/ night</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block rounded-md border border-sand px-3 py-2">
          <span className="text-[11px] uppercase tracking-wide text-ink/50">Check-in</span>
          <input
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => { setCheckIn(e.target.value); setAvailability('unknown'); }}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </label>
        <label className="block rounded-md border border-sand px-3 py-2">
          <span className="text-[11px] uppercase tracking-wide text-ink/50">Check-out</span>
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(e) => { setCheckOut(e.target.value); setAvailability('unknown'); }}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </label>
        <label className="block rounded-md border border-sand px-3 py-2">
          <span className="text-[11px] uppercase tracking-wide text-ink/50">Adults</span>
          <input
            type="number" min={1} max={maxGuests}
            value={adults}
            onChange={(e) => { setAdults(Number(e.target.value)); setAvailability('unknown'); }}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </label>
        <label className="block rounded-md border border-sand px-3 py-2">
          <span className="text-[11px] uppercase tracking-wide text-ink/50">Children</span>
          <input
            type="number" min={0} max={maxGuests}
            value={children}
            onChange={(e) => { setChildren(Number(e.target.value)); setAvailability('unknown'); }}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </label>
      </div>

      {overCapacity && (
        <p className="mt-3 text-sm text-red-600">This room accommodates up to {maxGuests} guests.</p>
      )}

      {nights > 0 && !overCapacity && (
        <div className="mt-4 space-y-1 border-t border-sand pt-4 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>{formatCurrency(pricePerNight)} × {nights} night{nights > 1 ? 's' : ''}</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between pt-1 font-medium text-ink">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center"
          onClick={handleCheck}
          disabled={pending || overCapacity || nights <= 0}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check Availability'}
        </Button>

        {availability === 'available' && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Available for these dates</p>
        )}
        {availability === 'unavailable' && (
          <p className="flex items-center gap-1.5 text-sm text-red-600"><XCircle className="h-4 w-4" /> Not available for these dates</p>
        )}

        <Button
          type="button"
          className="w-full justify-center"
          onClick={handleReserve}
          disabled={overCapacity || nights <= 0}
        >
          Reserve This Room
        </Button>
      </div>
    </div>
  );
}
