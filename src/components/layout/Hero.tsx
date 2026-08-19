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
        <Image
          src="https://picsum.photos/seed/lakesprings-hero/2000/1400"
          alt={`${name} at dusk, viewed across the lake`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-reservoir/85 via-reservoir/20 to-reservoir/40" />

        <div className="container-lake relative flex h-full flex-col items-start justify-center pb-24 text-white">
          <p className="eyebrow animate-rise text-white/90">Welcome to</p>
          <h1 className="mt-3 animate-rise font-display text-5xl leading-[1.05] text-[#EFBF04] md:text-7xl">
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
