import { describe, expect, it } from 'vitest';

import { formatCountdown } from './format';

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
