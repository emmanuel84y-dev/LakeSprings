import { z } from 'zod';

export const bookingSchema = z
  .object({
    room_id: z.string().uuid(),
    check_in: z.string().min(1, 'Check-in date is required'),
    check_out: z.string().min(1, 'Check-out date is required'),
    adults: z.coerce.number().int().min(1, 'At least 1 adult is required').max(20),
    children: z.coerce.number().int().min(0).max(20).default(0),
    guest_name: z.string().min(2, 'Enter your full name').max(120),
    guest_email: z.string().email('Enter a valid email address'),
    guest_phone: z.string().min(7, 'Enter a valid phone number').max(20),
    guest_whatsapp: z.string().max(20).optional().or(z.literal('')),
    special_requests: z.string().max(1000).optional().or(z.literal('')),
  })
  .refine((data) => new Date(data.check_out) > new Date(data.check_in), {
    message: 'Check-out date must be after check-in date',
    path: ['check_out'],
  })
  .refine((data) => new Date(data.check_in) >= new Date(new Date().toDateString()), {
    message: 'Check-in date cannot be in the past',
    path: ['check_in'],
  });

export type BookingInput = z.infer<typeof bookingSchema>;
