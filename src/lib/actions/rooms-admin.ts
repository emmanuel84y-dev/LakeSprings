'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { roomSchema } from '@/lib/validation/room';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function parseRoomForm(formData: FormData) {
  const amenityIds = formData.getAll('amenity_ids').map(String);
  return roomSchema.safeParse({
    name: formData.get('name'), room_number: formData.get('room_number'), slug: formData.get('slug'),
    room_type: formData.get('room_type'), description: formData.get('description'),
    price_per_night: formData.get('price_per_night'), max_guests: formData.get('max_guests'),
    bed_type: formData.get('bed_type'), size_sqm: formData.get('size_sqm') || undefined,
    floor: formData.get('floor'), featured: formData.get('featured') === 'on', active: formData.get('active') === 'on',
    amenity_ids: amenityIds,
  });
}

export async function createRoom(formData: FormData) {
  const parsed = parseRoomForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  const supabase = createClient();
  const { amenity_ids, ...room } = parsed.data;
  const { data: created, error } = await supabase.from('rooms').insert(room).select('id').single();
  if (error || !created) return { ok: false, error: error?.code === '23505' ? 'That slug is already in use' : 'Could not create the room' };
  if (amenity_ids.length) await supabase.from('room_amenities').insert(amenity_ids.map((amenity_id) => ({ room_id: created.id, amenity_id })));
  revalidatePath('/admin/rooms'); revalidatePath('/rooms'); revalidatePath('/');
  redirect(`/admin/rooms/${created.id}/edit`);
}

export async function updateRoom(roomId: string, formData: FormData) {
  const parsed = parseRoomForm(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  const supabase = createClient();
  const { amenity_ids, ...room } = parsed.data;
  const { error } = await supabase.from('rooms').update(room).eq('id', roomId);
  if (error) return { ok: false, error: error.code === '23505' ? 'That slug is already in use' : 'Could not save changes' };
  await supabase.from('room_amenities').delete().eq('room_id', roomId);
  if (amenity_ids.length) await supabase.from('room_amenities').insert(amenity_ids.map((amenity_id) => ({ room_id: roomId, amenity_id })));
  revalidatePath('/admin/rooms'); revalidatePath(`/admin/rooms/${roomId}/edit`); revalidatePath(`/rooms`); revalidatePath('/');
  return { ok: true };
}

export async function archiveRoom(roomId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('rooms').update({ archived: true, active: false }).eq('id', roomId);
  if (error) return { ok: false, error: 'Could not archive the room' };
  revalidatePath('/admin/rooms'); revalidatePath('/rooms'); revalidatePath('/');
  return { ok: true };
}

export async function uploadRoomImage(roomId: string, formData: FormData) {
  const file = formData.get('file') as File | null;
  const url = String(formData.get('url') ?? '').trim();

  if (url) {
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return { ok: false, error: 'Enter a valid http(s) image URL' };
    }
  }

  if ((!file || file.size === 0) && !url) return { ok: false, error: 'Choose an image or paste an image URL' };
  if (file && file.size > 0 && !ALLOWED_TYPES.includes(file.type)) return { ok: false, error: 'Use a JPEG, PNG, or WebP image' };
  if (file && file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Image must be under 5MB' };

  const supabase = createClient();
  let path = url;

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    path = `${roomId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('room-images').upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) return { ok: false, error: 'Upload failed. Please try again.' };
  }

  const { count } = await supabase.from('room_images').select('id', { count: 'exact', head: true }).eq('room_id', roomId);
  const { error: insertError } = await supabase.from('room_images').insert({
    room_id: roomId,
    storage_path: path,
    alt_text: file && file.size > 0 ? file.name.replace(/\.[^/.]+$/, '') : 'Room image',
    display_order: count ?? 0,
    is_primary: (count ?? 0) === 0,
  });

  if (insertError) {
    if (file && file.size > 0) await supabase.storage.from('room-images').remove([path]);
    return { ok: false, error: 'Could not save the image record' };
  }

  revalidatePath(`/admin/rooms/${roomId}/edit`); revalidatePath('/rooms'); revalidatePath('/');
  return { ok: true };
}

export async function deleteRoomImage(roomId: string, imageId: string, storagePath: string) {
  const supabase = createClient();
  if (!storagePath.startsWith('http')) await supabase.storage.from('room-images').remove([storagePath]);
  const { error } = await supabase.from('room_images').delete().eq('id', imageId);
  if (error) return { ok: false, error: 'Could not remove the image' };
  revalidatePath(`/admin/rooms/${roomId}/edit`); revalidatePath('/rooms'); revalidatePath('/');
  return { ok: true };
}

export async function setPrimaryRoomImage(roomId: string, imageId: string) {
  const supabase = createClient();
  await supabase.from('room_images').update({ is_primary: false }).eq('room_id', roomId);
  const { error } = await supabase.from('room_images').update({ is_primary: true }).eq('id', imageId);
  if (error) return { ok: false, error: 'Could not update the primary image' };
  revalidatePath(`/admin/rooms/${roomId}/edit`); revalidatePath('/rooms'); revalidatePath('/');
  return { ok: true };
}

export async function reorderRoomImage(roomId: string, imageId: string, direction: 'up' | 'down') {
  const supabase = createClient();
  const { data: images } = await supabase.from('room_images').select('id, display_order').eq('room_id', roomId).order('display_order', { ascending: true });
  if (!images) return { ok: false, error: 'Could not load images' };
  const index = images.findIndex((i) => i.id === imageId);
  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= images.length) return { ok: true };
  const a = images[index]; const b = images[swapWith];
  await supabase.from('room_images').update({ display_order: b.display_order }).eq('id', a.id);
  await supabase.from('room_images').update({ display_order: a.display_order }).eq('id', b.id);
  revalidatePath(`/admin/rooms/${roomId}/edit`); revalidatePath('/rooms'); revalidatePath('/');
  return { ok: true };
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
  if (error) return { ok: false, error: 'Could not update the booking' };
  revalidatePath('/admin/bookings'); revalidatePath('/admin');
  return { ok: true };
}
