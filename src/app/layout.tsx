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
  metadataBase: new URL('https://www.lakespringshotels.com.ng'),
  title: {
    default: 'LakeSprings Hotels | Hotel in Agodi, Ibadan, Oyo State',
    template: '%s — LakeSprings Hotels',
  },
  description:
    'LakeSprings Hotels offers comfortable rooms and a serene stay at 14 Agodi Reservoir Road, Ibadan, Oyo State, Nigeria.',
  openGraph: {
    title: 'LakeSprings Hotels | Hotel in Agodi, Ibadan',
    description:
      'LakeSprings Hotels offers comfortable rooms and a serene stay in Ibadan, Oyo State, Nigeria.',
    siteName: 'LakeSprings Hotels',
    type: 'website',
    url: 'https://www.lakespringshotels.com.ng/',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'LakeSprings Hotels logo' }],
  },
  twitter: { card: 'summary_large_image', title: 'LakeSprings Hotels | Hotel in Agodi, Ibadan', description: 'Comfortable hotel rooms and a serene stay in Ibadan, Oyo State, Nigeria.', images: ['/images/hero.jpg'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
