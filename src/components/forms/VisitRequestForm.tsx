'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { submitVisitRequest } from '@/lib/actions/visit';

const todayISO = () => new Date().toISOString().split('T')[0];

export function VisitRequestForm() {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setStatus('idle');
    startTransition(async () => {
      const result = await submitVisitRequest(formData);
      if (result.ok) setStatus('done');
      else { setStatus('error'); setError(result.error ?? 'Something went wrong'); }
    });
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-5 w-5 shrink-0" /> Your visit request has been received — we'll confirm by email.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" required><Input id="name" name="name" required /></FormField>
        <FormField label="Email" htmlFor="email" required><Input id="email" name="email" type="email" required /></FormField>
        <FormField label="Phone" htmlFor="phone" required><Input id="phone" name="phone" type="tel" required /></FormField>
        <FormField label="Number of visitors" htmlFor="num_visitors" required><Input id="num_visitors" name="num_visitors" type="number" min={1} defaultValue={1} required /></FormField>
        <FormField label="Preferred date" htmlFor="visit_date" required><Input id="visit_date" name="visit_date" type="date" min={todayISO()} required /></FormField>
        <FormField label="Preferred time" htmlFor="preferred_time" required><Input id="preferred_time" name="preferred_time" type="time" required /></FormField>
      </div>
      <FormField label="Message" htmlFor="message"><Textarea id="message" name="message" rows={4} /></FormField>

      {status === 'error' && (
        <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle className="h-4 w-4" /> {error}</p>
      )}

      <Button type="submit" disabled={pending}>{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Request Visit'}</Button>
    </form>
  );
}
