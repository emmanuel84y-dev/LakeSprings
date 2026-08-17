import { z } from 'zod';

export const roomSchema = z.object({
  name: z.string().min(2, 'Room name is required').max(120),
  room_number: z.string().max(20).optional().or(z.literal('')),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  room_type: z.string().min(2, 'Room type is required').max(60),
  description: z.string().max(4000).optional().or(z.literal('')),
  price_per_night: z.coerce.number().min(0, 'Price cannot be negative'),
  max_guests: z.coerce.number().int().min(1, 'Must accommodate at least 1 guest'),
  bed_type: z.string().max(60).optional().or(z.literal('')),
  size_sqm: z.coerce.number().min(0).optional(),
  floor: z.string().max(40).optional().or(z.literal('')),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
  amenity_ids: z.array(z.string().uuid()).default([]),
});

export type RoomInput = z.infer<typeof roomSchema>;
