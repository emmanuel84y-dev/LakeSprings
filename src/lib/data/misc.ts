import { createClient } from '@/lib/supabase/server';
import type { Room, RoomWithImages } from '@/types/database';

export async function getBookableRooms(): Promise<Room[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*')
    .eq('active', true)
    .eq('archived', false)
    .order('name');
  return (data as Room[]) ?? [];
}

export async function getRoomWithImagesBySlug(slug: string): Promise<RoomWithImages | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('slug', slug)
    .eq('active', true)
    .eq('archived', false)
    .maybeSingle();
  return data as RoomWithImages | null;
}
