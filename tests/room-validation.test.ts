import { describe, it, expect } from 'vitest';
import { roomSchema } from '@/lib/validation/room';

const validBase = {
  name: 'Deluxe Room',
  room_type: 'Deluxe',
  price_per_night: '75000',
  max_guests: '2',
};

describe('roomSchema', () => {
  it('accepts a well-formed slug', () => {
    const result = roomSchema.safeParse({ ...validBase, slug: 'deluxe-room' });
    expect(result.success).toBe(true);
  });

  it('rejects a slug with spaces or uppercase letters', () => {
    const result = roomSchema.safeParse({ ...validBase, slug: 'Deluxe Room' });
    expect(result.success).toBe(false);
  });

  it('rejects a negative price', () => {
    const result = roomSchema.safeParse({ ...validBase, slug: 'deluxe-room', price_per_night: '-10' });
    expect(result.success).toBe(false);
  });

  it('rejects zero max guests', () => {
    const result = roomSchema.safeParse({ ...validBase, slug: 'deluxe-room', max_guests: '0' });
    expect(result.success).toBe(false);
  });
});
