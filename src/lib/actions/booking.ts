'use server';

import { createClient } from '@/lib/supabase/server';
import { bookingSchema } from '@/lib/validation/booking';
import type { Booking } from '@/types/database';

interface ActionResult {
  ok: boolean;
  booking?: Booking;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createBooking(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: 'Please check the highlighted fields', fieldErrors };
  }

  const data = parsed.data;
  const supabase = createClient();

  // The database is the final authority here: create_booking() runs
  // inside a Postgres function that takes an advisory lock on the room
  // and is backstopped by an exclusion constraint, so two guests
  // racing for the same dates can never both succeed. We never
  // pre-compute price or availability on the client and trust it.
  const { data: booking, error } = await supabase.rpc('create_booking', {
    p_room_id: data.room_id,
    p_check_in: data.check_in,
    p_check_out: data.check_out,
    p_adults: data.adults,
    p_children: data.children,
    p_guest_name: data.guest_name,
    p_guest_email: data.guest_email,
    p_guest_phone: data.guest_phone,
    p_guest_whatsapp: data.guest_whatsapp || null,
    p_special_requests: data.special_requests || null,
  });

  if (error) {
    // Postgres RAISE EXCEPTION messages from create_booking() are
    // written to be guest-readable (see 0004_functions.sql) — surface
    // them directly instead of a raw stack trace.
    return { ok: false, error: error.message.replace(/^.*?:\s*/, '') };
  }

  return { ok: true, booking: booking as Booking };
}

export async function checkRoomAvailability(roomId: string, checkIn: string, checkOut: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('is_room_available', {
    p_room_id: roomId,
    p_check_in: checkIn,
    p_check_out: checkOut,
  });
  if (error) return false;
  return Boolean(data);
}
