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

  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className={cn('sticky top-0 z-50 w-full border-b border-sand/60 bg-white/95 backdrop-blur-md transition-shadow duration-300', scrolled && 'shadow-sm')}>
      <div className="container-lake flex h-[72px] items-center justify-between md:h-20">
        <Link href="/" className="flex items-center gap-2 font-display text-xl text-reservoir md:text-[22px]">
          <Waves className="h-6 w-6 text-brass" strokeWidth={1.5} />
          <span>{hotelName}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative py-2 text-sm font-medium text-reservoir/80 transition-colors hover:text-reservoir',
                pathname === link.href && 'text-brass after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-brass'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block"><Button href="/booking" size="sm"><span className="mr-1">▣</span> Book Now</Button></div>

        <button className="grid h-10 w-10 place-items-center text-reservoir lg:hidden" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={cn('overflow-hidden bg-reservoir transition-[max-height] duration-300 lg:hidden', open ? 'max-h-[28rem]' : 'max-h-0')}>
        <nav className="container-lake flex flex-col gap-1 pb-6 pt-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={cn('rounded-md px-2 py-3 text-white/85 hover:bg-white/5 hover:text-white', pathname === link.href && 'text-brass')}>
              {link.label}
            </Link>
          ))}
          <Button href="/booking" className="mt-2 justify-center">Book Now</Button>
        </nav>
      </div>
    </header>
  );
}
