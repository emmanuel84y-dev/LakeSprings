'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { submitContactMessage } from '@/lib/actions/contact';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setStatus('idle');
    startTransition(async () => {
      const result = await submitContactMessage(formData);
      if (result.ok) setStatus('done');
      else { setStatus('error'); setError(result.error ?? 'Something went wrong'); }
    });
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" /> Thank you — we&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" required><Input id="name" name="name" required /></FormField>
        <FormField label="Email" htmlFor="email" required><Input id="email" name="email" type="email" required /></FormField>
        <FormField label="Phone" htmlFor="phone"><Input id="phone" name="phone" type="tel" /></FormField>
        <FormField label="Subject" htmlFor="subject"><Input id="subject" name="subject" /></FormField>
      </div>
      <FormField label="Message" htmlFor="message" required>
        <Textarea id="message" name="message" rows={5} required />
      </FormField>

      {status === 'error' && (
        <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle className="h-4 w-4" /> {error}</p>
      )}

      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Message'}</Button>
    </form>
  );
}
