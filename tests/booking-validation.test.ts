import { describe, it, expect } from 'vitest';
import { bookingSchema } from '@/lib/validation/booking';

const validBase = {
  room_id: '11111111-1111-4111-8111-111111111111',
  adults: '2',
  children: '0',
  guest_name: 'Ada Lovelace',
  guest_email: 'ada@example.com',
  guest_phone: '+2348000000000',
};

function futureDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

describe('bookingSchema', () => {
  it('accepts a valid future date range', () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      check_in: futureDate(5),
      check_out: futureDate(8),
    });
    expect(result.success).toBe(true);
  });

  it('rejects check-out on or before check-in', () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      check_in: futureDate(5),
      check_out: futureDate(5),
    });
    expect(result.success).toBe(false);
  });

  it('rejects a check-in date in the past', () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      check_in: futureDate(-2),
      check_out: futureDate(1),
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      guest_email: 'not-an-email',
      check_in: futureDate(5),
      check_out: futureDate(8),
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero adults', () => {
    const result = bookingSchema.safeParse({
      ...validBase,
      adults: '0',
      check_in: futureDate(5),
      check_out: futureDate(8),
    });
    expect(result.success).toBe(false);
  });
});
