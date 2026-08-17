import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import type { HotelSettings } from '@/types/database';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getHotelSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const name = settings?.name ?? 'LakeSprings Hotels';
  const tagline = settings?.tagline ?? 'Comfort. Stillness. Exceptional Hospitality.';

  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${name} — ${tagline}`, template: `%s — ${name}` },
    description: settings?.description || tagline,
    openGraph: {
      title: name,
      description: settings?.description || tagline,
      siteName: name,
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
  };
}

async function getHotelSettings(): Promise<HotelSettings | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase.from('hotel_settings').select('*').eq('id', 1).maybeSingle();
    return data as HotelSettings | null;
  } catch {
    return null;
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
