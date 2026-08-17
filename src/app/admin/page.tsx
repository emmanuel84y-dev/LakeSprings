import Link from 'next/link';
import {
  BedDouble, DoorOpen, LogIn, LogOut, Clock, CheckCircle2,
  Wallet, Mail, CalendarCheck2, ArrowRight,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/data/admin';
import { getAdminBookings } from '@/lib/data/admin';
import { StatsCard } from '@/components/admin/StatsCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default async function AdminDashboardPage() {
  const [stats, recentBookings] = await Promise.all([
    getDashboardStats(),
    getAdminBookings({}),
  ]);

  const latest = recentBookings.slice(0, 5);

  return (
    <div>
      <p className="eyebrow">Overview</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Good to see you</h1>

      {stats ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatsCard label="Total Rooms" value={stats.total_rooms} icon={BedDouble} />
            <StatsCard label="Active Rooms" value={stats.active_rooms} icon={DoorOpen} />
            <StatsCard label="Occupied Today" value={stats.occupied_today} icon={CheckCircle2} tone="brass" />
            <StatsCard label="Pending Bookings" value={stats.pending_bookings} icon={Clock} tone="warning" />
            <StatsCard label="Today's Arrivals" value={stats.todays_arrivals} icon={LogIn} />
            <StatsCard label="Today's Departures" value={stats.todays_departures} icon={LogOut} />
            <StatsCard label="Revenue (30d)" value={formatCurrency(stats.revenue_30d)} icon={Wallet} tone="brass" />
            <StatsCard label="Unread Messages" value={stats.new_messages} icon={Mail} />
          </div>

          {/* Simple occupancy bar — real data, no charting dependency required */}
          <div className="mt-8 rounded-xl border border-sand bg-white p-6">
            <p className="text-sm font-medium text-ink">Rooms occupied today</p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-mist">
              <div
                className="h-full bg-brass transition-all"
                style={{ width: `${stats.active_rooms ? Math.min(100, (stats.occupied_today / stats.active_rooms) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink/50">
              {stats.occupied_today} of {stats.active_rooms} active rooms occupied
            </p>
          </div>
        </>
      ) : (
        <p className="mt-8 text-ink/60">Could not load dashboard stats.</p>
      )}

      <div className="mt-10 rounded-xl border border-sand bg-white">
        <div className="flex items-center justify-between border-b border-sand px-6 py-4">
          <p className="font-display text-lg text-ink">Recent Bookings</p>
          <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-brass hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {latest.length > 0 ? (
          <div className="divide-y divide-sand">
            {latest.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-6 py-4 text-sm">
                <div>
                  <p className="font-medium text-ink">{b.guest_name}</p>
                  <p className="text-ink/50">{b.rooms?.name} · {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-ink/70">{formatCurrency(b.total_amount)}</span>
                  <Badge tone={statusTone(b.status)}>{b.status.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <CalendarCheck2 className="h-6 w-6 text-ink/30" />
            <p className="text-sm text-ink/50">No bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'brass' {
  if (status === 'confirmed' || status === 'checked_in' || status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled' || status === 'no_show') return 'danger';
  return 'neutral';
}
