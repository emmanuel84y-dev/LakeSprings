import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, Booking, RoomWithImages, Amenity } from '@/types/database';

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('admin_dashboard_stats');
  if (error) return null;
  return data as DashboardStats;
}

export async function getAdminRooms(): Promise<RoomWithImages[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('archived', false)
    .order('created_at', { ascending: false });
  return (data as RoomWithImages[]) ?? [];
}

export async function getAdminRoomById(id: string) {
  const supabase = createClient();
  const { data: room } = await supabase.from('rooms').select('*, room_images(*)').eq('id', id).maybeSingle();
  if (!room) return null;

  const { data: amenityLinks } = await supabase.from('room_amenities').select('amenity_id').eq('room_id', id);
  const selectedAmenityIds = (amenityLinks ?? []).map((l) => l.amenity_id);

  return { room: room as RoomWithImages, selectedAmenityIds };
}

export async function getAllAmenitiesAdmin(): Promise<Amenity[]> {
  const supabase = createClient();
  const { data } = await supabase.from('amenities').select('*').order('name');
  return (data as Amenity[]) ?? [];
}

interface BookingWithRoom extends Booking {
  rooms: { name: string; slug: string } | null;
}

export async function getAdminBookings(filters: { status?: string; search?: string }): Promise<BookingWithRoom[]> {
  const supabase = createClient();
  let query = supabase
    .from('bookings')
    .select('*, rooms(name, slug)')
    .order('created_at', { ascending: false })
    .limit(200);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.search) {
    query = query.or(
      `guest_name.ilike.%${filters.search}%,guest_email.ilike.%${filters.search}%,booking_reference.ilike.%${filters.search}%`
    );
  }

  const { data } = await query;
  return (data as BookingWithRoom[]) ?? [];
}
