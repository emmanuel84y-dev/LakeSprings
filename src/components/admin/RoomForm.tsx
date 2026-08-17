'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { Amenity, Room } from '@/types/database';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

interface RoomFormProps {
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string } | void>;
  room?: Room;
  amenities: Amenity[];
  selectedAmenityIds?: string[];
  submitLabel: string;
}

export function RoomForm({ action, room, amenities, selectedAmenityIds = [], submitLabel }: RoomFormProps) {
  const [name, setName] = useState(room?.name ?? '');
  const [slug, setSlug] = useState(room?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(room));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result && !result.ok) setError(result.error ?? 'Something went wrong');
    });
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Room name" htmlFor="name" required>
          <Input
            id="name" name="name" required value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </FormField>
        <FormField label="Slug (used in the room URL)" htmlFor="slug" required>
          <Input id="slug" name="slug" required value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
        </FormField>
        <FormField label="Room number" htmlFor="room_number">
          <Input id="room_number" name="room_number" defaultValue={room?.room_number ?? ''} />
        </FormField>
        <FormField label="Room type" htmlFor="room_type" required>
          <Input id="room_type" name="room_type" required defaultValue={room?.room_type ?? ''} placeholder="e.g. Deluxe, Suite" />
        </FormField>
        <FormField label="Price per night (₦)" htmlFor="price_per_night" required>
          <Input id="price_per_night" name="price_per_night" type="number" min={0} step="0.01" required defaultValue={room?.price_per_night ?? ''} />
        </FormField>
        <FormField label="Maximum guests" htmlFor="max_guests" required>
          <Input id="max_guests" name="max_guests" type="number" min={1} required defaultValue={room?.max_guests ?? 2} />
        </FormField>
        <FormField label="Bed type" htmlFor="bed_type">
          <Input id="bed_type" name="bed_type" defaultValue={room?.bed_type ?? ''} placeholder="e.g. King Bed" />
        </FormField>
        <FormField label="Room size (m²)" htmlFor="size_sqm">
          <Input id="size_sqm" name="size_sqm" type="number" min={0} step="0.1" defaultValue={room?.size_sqm ?? ''} />
        </FormField>
        <FormField label="Floor" htmlFor="floor">
          <Input id="floor" name="floor" defaultValue={room?.floor ?? ''} />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={5} defaultValue={room?.description ?? ''} />
      </FormField>

      {amenities.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink">Amenities</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {amenities.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  name="amenity_ids"
                  value={a.id}
                  defaultChecked={selectedAmenityIds.includes(a.id)}
                  className="h-4 w-4 rounded border-sand text-brass focus:ring-brass"
                />
                {a.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="featured" defaultChecked={room?.featured ?? false} className="h-4 w-4 rounded border-sand text-brass focus:ring-brass" />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="active" defaultChecked={room?.active ?? true} className="h-4 w-4 rounded border-sand text-brass focus:ring-brass" />
          Active (visible on the public site)
        </label>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  );
}
