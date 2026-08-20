import { getAllAmenitiesAdmin } from '@/lib/data/admin';
import { RoomForm } from '@/components/admin/RoomForm';
import { createRoom } from '@/lib/actions/rooms-admin';
import { BackLink } from '@/components/layout/BackLink';

export default async function NewRoomPage() {
  const amenities = await getAllAmenitiesAdmin();

  return (
    <div>
      <BackLink href="/admin/rooms" className="mb-6" />
      <p className="eyebrow">Rooms</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Add Room</h1>
      <p className="mt-1 text-sm text-ink/60">This room becomes bookable on the public site the moment you save it.</p>

      <div className="mt-8">
        <RoomForm action={createRoom} amenities={amenities} submitLabel="Create Room" />
      </div>
    </div>
  );
}
