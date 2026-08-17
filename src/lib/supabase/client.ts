// Browser-side Supabase client — for use in Client Components.
// Uses the public publishable key only; every privileged action is enforced
// by Row Level Security on the database, not by this client.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
