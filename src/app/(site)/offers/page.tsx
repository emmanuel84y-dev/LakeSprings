import type { Metadata } from 'next';
import { Tag } from 'lucide-react';
import { getActiveOffers } from '@/lib/data/content';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Offers' };

export default async function OffersPage() {
  const offers = await getActiveOffers();

  return (
    <div className="container-lake py-16">
      <p className="eyebrow">Offers</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Current promotions</h1>

      {offers.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border border-sand bg-white p-6">
              <span className="eyebrow">
                {offer.discount_type === 'percentage' ? `${offer.discount_value}% off` : `₦${offer.discount_value.toLocaleString()} off`}
              </span>
              <h2 className="mt-2 font-display text-2xl text-ink">{offer.title}</h2>
              <p className="mt-2 text-sm text-ink/60">{offer.description}</p>
              <p className="mt-3 text-xs text-ink/40">Valid through {formatDate(offer.end_date)}</p>
              {offer.offer_rooms.length > 0 && (
                <p className="mt-2 text-xs text-ink/50">Applies to: {offer.offer_rooms.map((r) => r.rooms.name).join(', ')}</p>
              )}
              <Button href="/booking" size="sm" className="mt-4">Book This Offer</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState icon={Tag} title="No offers currently available" description="Check back soon, or browse our full room list for standard rates." action={<Button href="/rooms" className="mt-2">View Rooms</Button>} />
        </div>
      )}
    </div>
  );
}
