import type { Metadata } from 'next';
import { Waves } from 'lucide-react';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata: Metadata = { title: 'Staff Login' };

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string; error?: string } }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-mist px-6 py-16">
      <div className="w-full max-w-sm rounded-xl border border-sand bg-white p-8 shadow-card">
        <div className="flex items-center gap-2 font-display text-lg text-ink">
          <Waves className="h-5 w-5 text-brass" /> LakeSprings Hotels
        </div>
        <h1 className="mt-4 font-display text-2xl text-ink">Staff sign in</h1>
        <p className="mt-1 text-sm text-ink/60">Access the admin dashboard.</p>

        {searchParams.error === 'not_authorized' && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            That account isn't set up for staff access. Contact your administrator.
          </p>
        )}

        <LoginForm redirectTo={searchParams.redirect ?? '/admin'} />

        <p className="mt-6 text-center text-xs text-ink/40">
          First time setting up? See the README's Admin Setup section.
        </p>
      </div>
    </div>
  );
}
