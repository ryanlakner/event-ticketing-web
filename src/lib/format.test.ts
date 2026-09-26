import { describe, expect, it } from 'vitest';

import { formatCountdown, toDateTimeLocal } from './format';

describe('formatCountdown', () => {
  it.each([
    [9 * 60_000 + 5_000, '9:05'],
    [59_001, '1:00'],
    [3_600_000 + 61_000, '1:01:01'],
    [0, '0:00'],
    [-5_000, '0:00'],
  ])('formats %d ms as %s', (milliseconds, expected) => {
    expect(formatCountdown(milliseconds)).toBe(expected);
  });
});

describe('toDateTimeLocal', () => {
  it('round-trips through the local time a datetime-local input shows', () => {
    const local = toDateTimeLocal('2030-05-01T23:45:00.000Z');

    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(new Date(local).toISOString()).toBe('2030-05-01T23:45:00.000Z');
  });
});
