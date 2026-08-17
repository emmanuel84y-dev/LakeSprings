'use server';

import { createClient } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validation/contact';

export async function submitContactMessage(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const supabase = createClient();
  const { error } = await supabase.from('contact_messages').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });

  if (error) return { ok: false, error: 'Something went wrong. Please try again.' };
  return { ok: true };
}
