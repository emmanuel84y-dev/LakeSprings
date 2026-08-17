import { describe, it, expect } from 'vitest';
import { nightsBetween, formatCurrency } from '@/lib/utils';

describe('nightsBetween', () => {
  it('calculates a simple 3-night stay', () => {
    expect(nightsBetween('2026-09-01', '2026-09-04')).toBe(3);
  });

  it('returns 0 for same-day check-in/out', () => {
    expect(nightsBetween('2026-09-01', '2026-09-01')).toBe(0);
  });

  it('never returns a negative number', () => {
    expect(nightsBetween('2026-09-04', '2026-09-01')).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('formats NGN amounts without decimals', () => {
    expect(formatCurrency(75000)).toContain('75,000');
  });
});
