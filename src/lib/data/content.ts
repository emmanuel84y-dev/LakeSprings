import { createClient } from '@/lib/supabase/server';
import type { GalleryItem, Offer, BlogPost, BlogCategory, HotelSettings } from '@/types/database';

export async function getHotelSettings(): Promise<HotelSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('hotel_settings').select('*').eq('id', 1).maybeSingle();
  return data as HotelSettings | null;
}

export async function getGallery(category?: string): Promise<GalleryItem[]> {
  const supabase = createClient();
  let query = supabase.from('gallery').select('*').order('display_order');
  if (category) query = query.eq('category', category);
  else query = query.not('category', 'in', '(setting_1,setting_2)');
  const { data } = await query;
  return (data as GalleryItem[]) ?? [];
}

interface OfferWithRooms extends Offer {
  offer_rooms: { rooms: { id: string; name: string; slug: string } }[];
}

export async function getActiveOffers(): Promise<OfferWithRooms[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('offers')
    .select('*, offer_rooms(rooms(id, name, slug))')
    .eq('active', true)
    .lte('start_date', new Date().toISOString().split('T')[0])
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false });
  return (data as unknown as OfferWithRooms[]) ?? [];
}

export async function getBlogPosts(): Promise<(BlogPost & { blog_categories: BlogCategory | null })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(*)')
    .eq('published', true)
    .order('published_at', { ascending: false });
  return (data as any) ?? [];
}

export async function getBlogPostBySlug(slug: string): Promise<(BlogPost & { blog_categories: BlogCategory | null }) | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*, blog_categories(*)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return data as any;
}
