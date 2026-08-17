import Link from 'next/link';
import { Waves, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import type { HotelSettings } from '@/types/database';
import { NewsletterForm } from '@/components/layout/NewsletterForm';

export function Footer({ settings }: { settings: HotelSettings | null }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-reservoir text-white">
      <div className="container-lake grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-xl">
            <Waves className="h-6 w-6 text-brass" strokeWidth={1.5} />
            {settings?.name ?? 'LakeSprings Hotels'}
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            {settings?.tagline ?? 'Comfort. Stillness. Exceptional Hospitality.'}
          </p>
          <div className="mt-6 flex gap-4">
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white/60 hover:text-brass">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-white/60 hover:text-brass">
                <Facebook className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="eyebrow text-brass/90">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/rooms" className="hover:text-white">Rooms</Link></li>
            <li><Link href="/offers" className="hover:text-white">Offers</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            <li><Link href="/visit" className="hover:text-white">Schedule a Visit</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-brass/90">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {settings?.address && (
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brass" /> {settings.address}</li>
            )}
            {settings?.phone && (
              <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brass" /> {settings.phone}</li>
            )}
            {settings?.email && (
              <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-brass" /> {settings.email}</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-lake flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/50 md:flex-row">
          <p>© {year} {settings?.name ?? 'LakeSprings Hotels'}. All rights reserved.</p>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
