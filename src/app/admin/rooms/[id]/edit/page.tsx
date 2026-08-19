import { notFound } from 'next/navigation';
import { getAdminRoomById, getAllAmenitiesAdmin } from '@/lib/data/admin';
import { RoomForm } from '@/components/admin/RoomForm';
import { RoomImageManager } from '@/components/admin/RoomImageManager';
import { ArchiveRoomButton } from '@/components/admin/ArchiveRoomButton';
import { updateRoom } from '@/lib/actions/rooms-admin';
import { BackLink } from '@/components/layout/BackLink';

export default async function EditRoomPage({ params }: { params: { id: string } }) {
  const [result, amenities] = await Promise.all([
    getAdminRoomById(params.id),
    getAllAmenitiesAdmin(),
  ]);

  if (!result) notFound();
  const { room, selectedAmenityIds } = result;
  const updateRoomWithId = updateRoom.bind(null, room.id);

  return (
    <div>
      <BackLink href="/admin/rooms" label="Back to Rooms" className="mb-6" />

      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Rooms</p>
          <h1 className="mt-1 font-display text-3xl text-ink">{room.name}</h1>
        </div>
        <ArchiveRoomButton roomId={room.id} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg text-ink">Details</h2>
          <div className="mt-4">
            <RoomForm action={updateRoomWithId} room={room} amenities={amenities} selectedAmenityIds={selectedAmenityIds} submitLabel="Save Changes" />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-ink">Images</h2>
          <div className="mt-4">
            <RoomImageManager roomId={room.id} images={room.room_images} />
          </div>
        </div>
      </div>
    </div>
  );
}
