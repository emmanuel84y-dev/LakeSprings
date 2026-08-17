import type { Metadata } from 'next';
import { MapPin, Phone, Mail } from 'lucide-react';
import { getHotelSettings } from '@/lib/data/content';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = { title: 'Contact' };

export default async function ContactPage() {
  const settings = await getHotelSettings();

  return (
    <div className="container-lake py-16">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Get in touch</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        <div className="space-y-5 text-sm text-ink/70">
          {settings?.address && <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brass" /> {settings.address}</p>}
          {settings?.phone && <p className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brass" /> {settings.phone}</p>}
          {settings?.email && <p className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-brass" /> {settings.email}</p>}
          {settings?.google_maps_url && (
            <a href={settings.google_maps_url} target="_blank" rel="noreferrer" className="inline-block text-brass underline">
              View on Google Maps
            </a>
          )}
        </div>
        <div className="md:col-span-2">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
