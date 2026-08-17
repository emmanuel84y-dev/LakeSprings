import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Enter your name').max(120),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().max(20).optional().or(z.literal('')),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(10, 'Tell us a little more (10+ characters)').max(2000),
});

export const visitSchema = z.object({
  name: z.string().min(2, 'Enter your name').max(120),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number').max(20),
  visit_date: z.string().min(1, 'Choose a date'),
  preferred_time: z.string().min(1, 'Choose a time'),
  num_visitors: z.coerce.number().int().min(1).max(50),
  message: z.string().max(1000).optional().or(z.literal('')),
});

export const newsletterSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  name: z.string().max(120).optional().or(z.literal('')),
});
