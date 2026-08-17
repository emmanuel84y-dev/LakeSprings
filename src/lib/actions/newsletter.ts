'use server';

import { createClient } from '@/lib/supabase/server';
import { newsletterSchema } from '@/lib/validation/contact';

export async function subscribeToNewsletter(email: string) {
  const parsed = newsletterSchema.safeParse({ email });
  if (!parsed.success) return { ok: false, error: 'Enter a valid email address' };

  const supabase = createClient();
  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: parsed.data.email })
    .select()
    .single();

  // A duplicate email is a unique-constraint violation (code 23505) —
  // treat re-subscribing as a success rather than an error.
  if (error && error.code !== '23505') {
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }

  return { ok: true };
}
