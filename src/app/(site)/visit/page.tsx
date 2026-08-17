import type { Metadata } from 'next';
import { VisitRequestForm } from '@/components/forms/VisitRequestForm';

export const metadata: Metadata = { title: 'Schedule a Visit' };

export default function VisitPage() {
  return (
    <div className="container-lake max-w-2xl py-16">
      <p className="eyebrow">Schedule a Visit</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Come see LakeSprings in person</h1>
      <p className="mt-3 text-ink/60">
        Considering LakeSprings for an event, a long stay, or just want a look around before booking? Tell us when works for you.
      </p>
      <div className="mt-8">
        <VisitRequestForm />
      </div>
    </div>
  );
}
