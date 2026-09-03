import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { BookingSearch } from '@/components/booking/BookingSearch';
import { BedDouble, CalendarCheck, Sparkles } from 'lucide-react';

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
    <section className="relative overflow-visible">
      <div className="relative h-auto min-h-[720px] w-full overflow-hidden md:h-[790px] md:min-h-0">
        <Image src="/images/hero-sm.jpg" alt={`${name} viewed across the lake`} fill priority sizes="100vw" className="object-cover object-center md:hidden" />
        <Image src="/images/hero.jpg" alt={`${name} viewed across the lake`} fill priority sizes="100vw" className="hidden object-cover object-center md:block" />

        <div className="absolute inset-0 bg-gradient-to-r from-reservoir/90 via-reservoir/45 to-reservoir/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-reservoir/85 via-transparent to-reservoir/20" />

        <div className="container-lake relative flex h-full flex-col items-start justify-start pb-12 pt-10 text-white md:justify-center md:pb-28 md:pt-10">
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.28em] text-white/90">Welcome to</p>
          <h1 className="mt-4 max-w-3xl animate-rise bg-gradient-to-b from-[#FFF4B8] via-[#E7C04A] to-[#B8860B] bg-clip-text font-display text-5xl font-medium leading-[0.98] text-transparent drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)] sm:text-6xl md:text-8xl">{name}</h1>
          <div className="mt-5 h-px w-12 bg-brass md:mt-7 md:w-14" />
          <p className="mt-4 max-w-xl animate-rise font-display text-lg leading-snug text-white/95 md:mt-5 md:text-xl">{tagline}</p>
          <p className="mt-3 max-w-lg animate-rise text-sm leading-6 text-white/70 md:text-base">A serene escape where comfort meets tranquility. Relax, unwind, and experience a more effortless stay.</p>

          <div className="mt-7 flex w-full animate-rise flex-col gap-3 sm:flex-row md:mt-9 md:w-auto md:gap-4">
            <Button href="/booking" size="lg" className="w-full shadow-lg sm:w-auto"><CalendarCheck className="h-4 w-4" />Book Your Stay</Button>
            <Button href="/rooms" size="lg" variant="outline" className="w-full border-white/80 bg-white/5 text-white backdrop-blur-sm hover:bg-white hover:text-reservoir sm:w-auto"><BedDouble className="h-4 w-4" />Explore Rooms</Button>
          </div>

          <div className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-2 border-t border-white/20 pt-5 sm:mt-10 sm:gap-4 sm:pt-6 md:mt-12 md:pt-7">
            <Feature icon={BedDouble} title="Comfortable Rooms" text="Thoughtfully designed" />
            <Feature icon={CalendarCheck} title="Easy Booking" text="Simple and secure" />
            <Feature icon={Sparkles} title="Exceptional Service" text="Made for your stay" />
          </div>
        </div>
      </div>

      <div className="container-lake relative z-10 -mt-6 md:-mt-16">
        <div className="rounded-2xl border border-sand/70 bg-white p-3 shadow-dock md:p-6"><BookingSearch roomTypes={roomTypes} /></div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:border-r sm:border-white/20 sm:pr-4 sm:text-left last:border-r-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brass/60 bg-reservoir/30 text-brass sm:h-10 sm:w-10"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
      <div className="min-w-0"><p className="font-display text-[11px] leading-tight text-white sm:text-sm">{title}</p><p className="mt-0.5 hidden text-xs text-white/55 sm:block">{text}</p></div>
    </div>
  );
}
