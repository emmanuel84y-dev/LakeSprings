import { createClient } from '@/lib/supabase/server';
import type { RoomWithImages, RoomWithDetails, Amenity } from '@/types/database';

export async function getFeaturedRooms(): Promise<RoomWithImages[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('active', true)
    .eq('archived', false)
    .eq('featured', true)
    .order('price_per_night', { ascending: true })
    .limit(3);
  return (data as RoomWithImages[]) ?? [];
}

export async function getRoomTypes(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from('rooms').select('room_type').eq('active', true).eq('archived', false);
  return Array.from(new Set((data ?? []).map((r) => r.room_type)));
}

interface RoomFilters {
  checkin?: string;
  checkout?: string;
  guests?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'featured';
}

export async function getRooms(filters: RoomFilters): Promise<RoomWithImages[]> {
  const supabase = createClient();

  // A real availability search: dates present means we call the same
  // RPC used everywhere else (search_available_rooms), so results here
  // are never "fake" — a room can only appear if the database itself
  // confirms it's free for those exact dates.
  if (filters.checkin && filters.checkout) {
    const { data: available } = await supabase.rpc('search_available_rooms', {
      p_check_in: filters.checkin,
      p_check_out: filters.checkout,
      p_guests: filters.guests ?? 1,
      p_room_type: filters.type ?? null,
    });

    const ids = (available ?? []).map((r: { id: string }) => r.id);
    if (ids.length === 0) return [];

    const { data } = await supabase.from('rooms').select('*, room_images(*)').in('id', ids);
    return applyPriceFilterAndSort((data as RoomWithImages[]) ?? [], filters, ids);
  }

  let query = supabase.from('rooms').select('*, room_images(*)').eq('active', true).eq('archived', false);

  if (filters.type) query = query.eq('room_type', filters.type);
  if (filters.guests) query = query.gte('max_guests', filters.guests);
  if (filters.minPrice != null) query = query.gte('price_per_night', filters.minPrice);
  if (filters.maxPrice != null) query = query.lte('price_per_night', filters.maxPrice);

  if (filters.sort === 'price_asc') query = query.order('price_per_night', { ascending: true });
  else if (filters.sort === 'price_desc') query = query.order('price_per_night', { ascending: false });
  else query = query.order('featured', { ascending: false }).order('price_per_night', { ascending: true });

  const { data } = await query;
  return (data as RoomWithImages[]) ?? [];
}

function applyPriceFilterAndSort(rooms: RoomWithImages[], filters: RoomFilters, orderedIds: string[]) {
  let result = rooms;
  if (filters.minPrice != null) result = result.filter((r) => r.price_per_night >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter((r) => r.price_per_night <= filters.maxPrice!);

  if (filters.sort === 'price_asc') return [...result].sort((a, b) => a.price_per_night - b.price_per_night);
  if (filters.sort === 'price_desc') return [...result].sort((a, b) => b.price_per_night - a.price_per_night);

  // default: preserve the order search_available_rooms already returned
  // (featured first, then price ascending)
  const order = new Map(orderedIds.map((id, i) => [id, i]));
  return [...result].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getRoomBySlug(slug: string): Promise<RoomWithDetails | null> {
  const supabase = createClient();
  const { data: room } = await supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('slug', slug)
    .eq('active', true)
    .eq('archived', false)
    .maybeSingle();

  if (!room) return null;

  const { data: amenityLinks } = await supabase
    .from('room_amenities')
    .select('amenities(*)')
    .eq('room_id', room.id);

  const amenities = ((amenityLinks ?? []) as unknown as { amenities: Amenity }[])
    .map((l) => l.amenities)
    .filter(Boolean);

  return { ...(room as RoomWithImages), amenities } as RoomWithDetails;
}

export async function getAllAmenities(): Promise<Amenity[]> {
  const supabase = createClient();
  const { data } = await supabase.from('amenities').select('*').eq('active', true).order('name');
  return (data as Amenity[]) ?? [];
}
