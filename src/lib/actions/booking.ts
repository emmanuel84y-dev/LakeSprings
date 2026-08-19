'use server';

import { createClient } from '@/lib/supabase/server';
import { bookingSchema } from '@/lib/validation/booking';
import { sendBookingConfirmationEmail } from '@/lib/email';
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
    return { ok: false, error: error.message.replace(/^.*?:\s*/, '') };
  }

  const createdBooking = booking as Booking;

  // Email delivery is deliberately non-blocking: a Resend outage must never
  // make a successfully-created reservation appear to have failed.
  try {
    const { data: room } = await supabase
      .from('rooms')
      .select('name')
      .eq('id', createdBooking.room_id)
      .maybeSingle();

    await sendBookingConfirmationEmail({
      ...createdBooking,
      room_name: room?.name ?? 'LakeSprings Hotels room',
    });
  } catch (emailError) {
    console.error('Booking confirmation email failed:', emailError);
  }

  return { ok: true, booking: createdBooking };
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
