import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getFeaturedRooms, getRoomTypes } from '@/lib/data/rooms';
import { Hero } from '@/components/layout/Hero';
import { RoomCard } from '@/components/rooms/RoomCard';
import { Button } from '@/components/ui/Button';
import type { HotelSettings, Testimonial } from '@/types/database';
import { Star } from 'lucide-react';

async function getSettings(): Promise<HotelSettings | null> {
  const supabase = createClient();
  const { data } = await supabase.from('hotel_settings').select('*').eq('id', 1).maybeSingle();
  return data as HotelSettings | null;
}

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .limit(3);
  return (data as Testimonial[]) ?? [];
}

export default async function HomePage() {
  const [settings, rooms, roomTypes, testimonials] = await Promise.all([
    getSettings(),
    getFeaturedRooms(),
    getRoomTypes(),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero
        name={settings?.name ?? 'LakeSprings Hotels'}
        tagline={settings?.tagline ?? 'Comfort. Stillness. Exceptional Hospitality.'}
        roomTypes={roomTypes}
      />

      {/* Featured Rooms */}
      <section className="reflect-below bg-mist py-24">
        <div className="container-lake">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Featured Rooms</p>
              <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">A room for every kind of stay</h2>
            </div>
            <Link href="/rooms" className="hidden text-sm font-medium text-brass hover:underline md:block">
              View all rooms →
            </Link>
          </div>

          {rooms.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-ink/60">Rooms are being added — check back shortly, or view the full list.</p>
          )}

          <div className="mt-8 md:hidden">
            <Button href="/rooms" variant="outline" className="w-full justify-center">View all rooms</Button>
          </div>
        </div>
      </section>

      <div className="waterline" />

      {/* Story / About teaser */}
      <section className="bg-reservoir py-24 text-white">
        <div className="container-lake grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow text-brass/90">The Setting</p>
            <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">
              Beside still water, in the middle of the city
            </h2>
            <p className="mt-4 max-w-md text-white/70">{settings?.description}</p>
            <Button href="/about" variant="outline" className="mt-6 border-white text-white hover:bg-white hover:text-reservoir">
              About LakeSprings
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-still" />
            <div className="mt-8 aspect-[3/4] overflow-hidden rounded-lg bg-still" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-mist py-24">
          <div className="container-lake">
            <p className="eyebrow text-center">Guest Stories</p>
            <h2 className="mt-2 text-center font-display text-3xl text-ink md:text-4xl">What guests are saying</h2>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-xl border border-sand bg-white p-6">
                  <div className="flex gap-0.5 text-brass">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-brass" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink/75">&ldquo;{t.review}&rdquo;</p>
                  <p className="mt-4 font-display text-ink">{t.guest_name}</p>
                  {t.location && <p className="text-xs text-ink/50">{t.location}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
