import Link from 'next/link';
import Image from 'next/image';
import { Plus, BedDouble } from 'lucide-react';
import { getAdminRooms } from '@/lib/data/admin';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, resolveImageUrl } from '@/lib/utils';

export default async function AdminRoomsPage() {
  const rooms = await getAdminRooms();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Rooms</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Manage Rooms</h1>
        </div>
        <Button href="/admin/rooms/new" className="gap-2"><Plus className="h-4 w-4" /> Add Room</Button>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={BedDouble}
            title="No rooms yet"
            description="Add your first room to have it appear on the public site immediately."
            action={<Button href="/admin/rooms/new" className="mt-2">Add Room</Button>}
          />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-sand bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-sand bg-mist/60 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3">Room</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Price / night</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {rooms.map((room) => {
                const primary = room.room_images.find((i) => i.is_primary) ?? room.room_images[0];
                return (
                  <tr key={room.id} className="hover:bg-mist/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-mist">
                          {primary && (
                            <Image src={resolveImageUrl(primary.storage_path, 'room-images')} alt={room.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{room.name}</p>
                          <p className="text-xs text-ink/50">{room.room_number ? `Room ${room.room_number}` : room.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{room.room_type}</td>
                    <td className="px-5 py-3 tabular-nums text-ink/70">{formatCurrency(room.price_per_night)}</td>
                    <td className="px-5 py-3 text-ink/70">{room.max_guests} guests</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {room.featured && <Badge tone="brass">Featured</Badge>}
                        <Badge tone={room.active ? 'success' : 'neutral'}>{room.active ? 'Active' : 'Inactive'}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/rooms/${room.id}/edit`} className="text-sm font-medium text-brass hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
