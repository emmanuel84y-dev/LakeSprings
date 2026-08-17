'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/actions/auth';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      // signIn redirects on success (throws NEXT_REDIRECT internally),
      // so reaching here means it did not.
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <FormField label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </FormField>
      <FormField label="Password" htmlFor="password" required>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </FormField>

      {error && (
        <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Button type="submit" className="w-full justify-center" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
      </Button>
    </form>
  );
}
