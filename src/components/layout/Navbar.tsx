'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Waves } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/offers', label: 'Offers' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar({ hotelName }: { hotelName: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = pathname?.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        scrolled || open ? 'bg-reservoir shadow-md' : 'bg-reservoir/0 backdrop-blur-0'
      )}
    >
      <div className="container-lake flex h-20 items-center justify-between">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 font-display text-xl transition-colors duration-300',
            scrolled || open ? 'text-white' : 'text-reservoir'
          )}
        >
          <Waves className="h-6 w-6 text-brass" strokeWidth={1.5} />
          {hotelName}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm transition-colors duration-300',
                pathname === link.href
                  ? 'text-brass'
                  : scrolled
                    ? 'text-white/80 hover:text-white'
                    : 'text-reservoir hover:text-reservoir/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/booking" size="sm">
            Book Now
          </Button>
        </div>

        <button
          className={cn(
            'grid h-10 w-10 place-items-center transition-colors duration-300 lg:hidden',
            scrolled || open ? 'text-white' : 'text-reservoir'
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden bg-reservoir transition-[max-height] duration-300 lg:hidden',
          open ? 'max-h-[28rem]' : 'max-h-0'
        )}
      >
        <nav className="container-lake flex flex-col gap-1 pb-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-3 text-white/85 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Button href="/booking" className="mt-2 justify-center">
            Book Now
          </Button>
        </nav>
      </div>
    </header>
  );
}
