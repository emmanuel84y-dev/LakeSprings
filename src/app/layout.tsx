import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakespringshotels.com.ng'),
  title: {
    default: 'LakeSprings Hotels — Comfort. Stillness. Exceptional Hospitality.',
    template: '%s — LakeSprings Hotels',
  },
  description:
    'A serene escape where comfort meets tranquility. Relax, unwind, and experience a more effortless stay at LakeSprings Hotels.',
  openGraph: {
    title: 'LakeSprings Hotels',
    description:
      'A serene escape where comfort meets tranquility. Relax, unwind, and experience a more effortless stay at LakeSprings Hotels.',
    siteName: 'LakeSprings Hotels',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
