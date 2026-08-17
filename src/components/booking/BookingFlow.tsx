'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { cn, formatCurrency, nightsBetween, resolveImageUrl } from '@/lib/utils';
import { createBooking } from '@/lib/actions/booking';
import type { RoomWithImages } from '@/types/database';

const steps = ['Dates & Guests', 'Review', 'Your Details'] as const;

const todayISO = () => new Date().toISOString().split('T')[0];

export function BookingFlow({
  rooms,
  initialRoomSlug,
  initialCheckIn,
  initialCheckOut,
  initialAdults,
  initialChildren,
}: {
  rooms: RoomWithImages[];
  initialRoomSlug?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [roomSlug, setRoomSlug] = useState(initialRoomSlug ?? rooms[0]?.slug ?? '');
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? todayISO());
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? '');
  const [adults, setAdults] = useState(initialAdults ?? 2);
  const [children, setChildren] = useState(initialChildren ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const room = rooms.find((r) => r.slug === roomSlug);
  const nights = checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const subtotal = room ? nights * room.price_per_night : 0;
  const overCapacity = room ? adults + children > room.max_guests : false;

  const canProceedStep1 = Boolean(room) && nights > 0 && !overCapacity;

  function handleSubmit(formData: FormData) {
    if (!room) return;
    setError(null);
    setFieldErrors({});

    formData.set('room_id', room.id);
    formData.set('check_in', checkIn);
    formData.set('check_out', checkOut);
    formData.set('adults', String(adults));
    formData.set('children', String(children));

    startTransition(async () => {
      const result = await createBooking(formData);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong');
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      router.push(`/booking/success?ref=${result.booking!.booking_reference}`);
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {/* Step indicator — a real sequence, so numbered markers earn their place here */}
        <ol className="flex items-center gap-3 text-sm">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  i < step ? 'bg-brass text-white' : i === step ? 'border-2 border-brass text-brass' : 'border border-sand text-ink/40'
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={i === step ? 'font-medium text-ink' : 'text-ink/40'}>{label}</span>
              {i < steps.length - 1 && <span className="mx-1 h-px w-8 bg-sand" />}
            </li>
          ))}
        </ol>

        {/* Step 1 — Dates & Guests */}
        {step === 0 && (
          <div className="mt-8 space-y-5">
            <FormField label="Room" htmlFor="room">
              <select
                id="room"
                value={roomSlug}
                onChange={(e) => setRoomSlug(e.target.value)}
                className="w-full rounded-md border border-sand bg-white px-4 py-3 text-sm focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.slug}>{r.name} — {formatCurrency(r.price_per_night)}/night</option>
                ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Check-in" htmlFor="checkin">
                <Input id="checkin" type="date" min={todayISO()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </FormField>
              <FormField label="Check-out" htmlFor="checkout">
                <Input id="checkout" type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Adults" htmlFor="adults">
                <Input id="adults" type="number" min={1} max={room?.max_guests ?? 10} value={adults} onChange={(e) => setAdults(Number(e.target.value))} />
              </FormField>
              <FormField label="Children" htmlFor="children">
                <Input id="children" type="number" min={0} max={room?.max_guests ?? 10} value={children} onChange={(e) => setChildren(Number(e.target.value))} />
              </FormField>
            </div>

            {overCapacity && room && (
              <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4" /> {room.name} accommodates up to {room.max_guests} guests.</p>
            )}
            {checkOut && nights <= 0 && (
              <p className="flex items-center gap-1.5 text-sm text-red-600"><AlertCircle className="h-4 w-4" /> Check-out must be after check-in.</p>
            )}

            <Button type="button" disabled={!canProceedStep1} onClick={() => setStep(1)}>
              Continue to Review
            </Button>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 1 && room && (
          <div className="mt-8 space-y-5">
            <div className="rounded-lg border border-sand p-5">
              <h3 className="font-display text-lg text-ink">{room.name}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-ink/70">
                <dt>Check-in</dt><dd className="text-right text-ink">{checkIn}</dd>
                <dt>Check-out</dt><dd className="text-right text-ink">{checkOut}</dd>
                <dt>Guests</dt><dd className="text-right text-ink">{adults} adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} children` : ''}</dd>
                <dt>Nights</dt><dd className="text-right text-ink">{nights}</dd>
              </dl>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button type="button" onClick={() => setStep(2)}>Continue to Your Details</Button>
            </div>
          </div>
        )}

        {/* Step 3 — Guest details & submit */}
        {step === 2 && room && (
          <form action={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="guest_name" required error={fieldErrors.guest_name}>
                <Input id="guest_name" name="guest_name" required />
              </FormField>
              <FormField label="Email" htmlFor="guest_email" required error={fieldErrors.guest_email}>
                <Input id="guest_email" name="guest_email" type="email" required />
              </FormField>
              <FormField label="Phone number" htmlFor="guest_phone" required error={fieldErrors.guest_phone}>
                <Input id="guest_phone" name="guest_phone" type="tel" required />
              </FormField>
              <FormField label="WhatsApp number" htmlFor="guest_whatsapp">
                <Input id="guest_whatsapp" name="guest_whatsapp" type="tel" />
              </FormField>
            </div>
            <FormField label="Special requests" htmlFor="special_requests">
              <Textarea id="special_requests" name="special_requests" rows={3} placeholder="Late arrival, dietary needs, accessibility, etc." />
            </FormField>

            {error && (
              <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" /> {error}</p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={pending}>Back</Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Reservation'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Summary sidebar */}
      <div>
        <div className="sticky top-24 rounded-xl border border-sand bg-white p-6 shadow-card">
          {room && (
            <>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                {room.room_images[0] && (
                  <Image
                    src={resolveImageUrl(room.room_images[0].storage_path, 'room-images')}
                    alt={room.name}
                    fill
                    sizes="30vw"
                    className="object-cover"
                  />
                )}
              </div>
              <h3 className="mt-4 font-display text-lg text-ink">{room.name}</h3>
              {nights > 0 && (
                <div className="mt-4 space-y-1 border-t border-sand pt-4 text-sm">
                  <div className="flex justify-between text-ink/60">
                    <span>{formatCurrency(room.price_per_night)} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-ink/60">
                    <span>Taxes &amp; fees</span>
                    <span className="tabular-nums">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-sand pt-2 font-medium text-ink">
                    <span>Total</span>
                    <span className="tabular-nums">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
