'use client';

import { useTransition } from 'react';
import { updateBookingStatus } from '@/lib/actions/rooms-admin';
import type { BookingStatus } from '@/types/database';

const statuses: BookingStatus[] = [
  'pending',
  'confirmed',
  'cancelled',
  'checked_in',
  'checked_out',
  'completed',
  'no_show',
];

const toneClass: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  checked_in: 'bg-blue-100 text-blue-800',
  checked_out: 'bg-slate-100 text-slate-700',
  completed: 'bg-emerald-100 text-emerald-800',
  no_show: 'bg-red-100 text-red-800',
};

interface BookingStatusSelectProps {
  bookingId: string;
  status: BookingStatus;
}

export function BookingStatusSelect({
  bookingId,
  status,
}: BookingStatusSelectProps) {
  const [pending, startTransition] = useTransition();

  const handleChange = (newStatus: string) => {
    startTransition(async () => {
      await updateBookingStatus(bookingId, newStatus);
    });
  };

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize focus:outline-none focus:ring-1 focus:ring-brass disabled:opacity-50 ${toneClass[status]}`}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}
