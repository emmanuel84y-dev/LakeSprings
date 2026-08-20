import type { Metadata } from 'next';
import Image from 'next/image';
import { getHotelSettings } from '@/lib/data/content';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const settings = await getHotelSettings();

  return (
    <div>
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden">
        <picture className="absolute inset-0">
          <source media="(max-width: 1023px)" srcSet="/images/about-md.jpg" />
          <Image
            src="/images/about.jpg"
            alt="LakeSprings Hotels exterior"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </picture>
        <div className="absolute inset-0 bg-reservoir/50" />
        <div className="container-lake relative flex h-full items-end pb-12 text-white">
          <div>
            <p className="eyebrow text-white/80">About Us</p>
            <h1 className="mt-2 font-display text-4xl text-[#EFBF04] md:text-5xl">{settings?.name ?? 'LakeSprings Hotels'}</h1>
          </div>
        </div>
      </div>

      <div className="container-lake grid gap-10 py-16 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-ink">Our story</h2>
          <p className="mt-4 leading-relaxed text-ink/70">
            {settings?.description || 'LakeSprings Hotels blends calm, considered design with warm hospitality, set beside quiet water.'}
          </p>
          <h2 className="mt-8 font-display text-2xl text-ink">What guests can expect</h2>
          <ul className="mt-4 space-y-2 text-ink/70">
            <li>· Rooms with a genuine view of the lake gardens</li>
            <li>· A team that knows your name by day two</li>
            <li>· Quiet, well-kept grounds in the middle of the city</li>
          </ul>
        </div>

        <div className="rounded-xl border border-sand bg-white p-6">
          <p className="text-sm font-medium text-ink">Good to know</p>
          <dl className="mt-4 space-y-3 text-sm text-ink/70">
            <div className="flex justify-between"><dt>Check-in</dt><dd>{settings?.check_in_time ?? '14:00'}</dd></div>
            <div className="flex justify-between"><dt>Check-out</dt><dd>{settings?.check_out_time ?? '11:00'}</dd></div>
            <div className="flex justify-between"><dt>Address</dt><dd className="text-right">{settings?.address}</dd></div>
          </dl>
          <Button href="/booking" className="mt-5 w-full justify-center">Book Your Stay</Button>
        </div>
      </div>
    </div>
  );
}
