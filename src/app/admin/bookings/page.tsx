import { CalendarRange } from 'lucide-react';
import { getAdminBookings } from '@/lib/data/admin';
import { BookingStatusSelect } from '@/components/admin/BookingStatusSelect';
import { BookingSearchBar } from '@/components/admin/BookingSearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const bookings = await getAdminBookings({ status: searchParams.status, search: searchParams.q });

  return (
    <div>
      <p className="eyebrow">Bookings</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Manage Bookings</h1>

      <div className="mt-6">
        <BookingSearchBar />
      </div>

      {bookings.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={CalendarRange} title="No bookings found" description="Try a different search or status filter." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-sand bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-sand bg-mist/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Guest</th>
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Guests</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-mist/40">
                  <td className="px-5 py-3 font-mono text-xs text-brass">{b.booking_reference}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{b.guest_name}</p>
                    <p className="text-xs text-ink/50">{b.guest_email}</p>
                  </td>
                  <td className="px-5 py-3 text-ink/70">{b.rooms?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-ink/70">{formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}</td>
                  <td className="px-5 py-3 text-ink/70">{b.adults + b.children}</td>
                  <td className="px-5 py-3 tabular-nums text-ink/70">{formatCurrency(b.total_amount)}</td>
                  <td className="px-5 py-3"><BookingStatusSelect bookingId={b.id} status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
