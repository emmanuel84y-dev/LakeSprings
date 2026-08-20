import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { BookingSearch } from '@/components/booking/BookingSearch';

export function Hero({
  name,
  tagline,
  roomTypes,
}: {
  name: string;
  tagline: string;
  roomTypes: string[];
}) {
  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden md:h-[86vh]">
        {/* Dedicated mobile image to prevent the desktop hero from being
            aggressively cropped/upscaled on small screens. */}
        <Image
          src="/images/hero-sm.jpg"
          alt={`${name} at dusk, viewed across the lake`}
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <Image
          src="/images/hero.jpg"
          alt={`${name} at dusk, viewed across the lake`}
          fill
          priority
          sizes="(max-width: 767px) 0vw, 100vw"
          className="hidden object-cover md:block"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-reservoir/90 via-reservoir/30 to-reservoir/50" />

        <div className="container-lake relative flex h-full flex-col items-start justify-center pb-24 text-white">
          <p className="eyebrow animate-rise text-white/90">Welcome to</p>
          <h1 className="mt-3 animate-rise bg-gradient-to-b from-[#FFF3B0] via-[#D4AF37] to-[#B8860B] bg-clip-text font-display text-5xl font-medium leading-[1.05] text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] md:text-7xl">
            {name}
          </h1>
          <p className="mt-5 max-w-md animate-rise text-base text-white/80 md:text-lg">
            {tagline}
          </p>
          <div className="mt-8 flex animate-rise flex-wrap gap-4">
            <Button href="/booking" size="lg">Book Your Stay</Button>
            <Button href="/rooms" size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-reservoir">
              Explore Rooms
            </Button>
          </div>
        </div>
      </div>

      {/* The floating "dock" — the booking search extends over the
          hero's bottom edge like a pier over water. */}
      <div className="container-lake relative -mt-16 md:-mt-20">
        <div className="rounded-xl bg-white p-5 shadow-dock md:p-6">
          <BookingSearch roomTypes={roomTypes} />
        </div>
      </div>
    </section>
  );
}
