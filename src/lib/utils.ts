import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency: string = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/** Resolve a stored image path to a browsable URL. Seed data stores full
 *  picsum.photos URLs directly; real uploads store a Supabase Storage
 *  object path, which we resolve to a public URL here. */
export function resolveImageUrl(storagePath: string, bucket: string) {
  if (storagePath.startsWith('http')) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}
