'use server';

import { createClient } from '@/lib/supabase/server';
import { visitSchema } from '@/lib/validation/contact';

export async function submitVisitRequest(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = visitSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const supabase = createClient();
  const { error } = await supabase.from('visit_requests').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    visit_date: parsed.data.visit_date,
    preferred_time: parsed.data.preferred_time,
    num_visitors: parsed.data.num_visitors,
    message: parsed.data.message || null,
  });

  if (error) return { ok: false, error: 'Something went wrong. Please try again.' };
  return { ok: true };
}
