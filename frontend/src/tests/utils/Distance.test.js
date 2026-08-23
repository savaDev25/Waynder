import { describe, it, expect } from 'vitest';
import { haversineKm, formatDistance } from '../../utils/Distance';

describe('haversineKm', () => {
  it('returns ~0 for the same point', () => {
    expect(haversineKm(20.6597, -103.3496, 20.6597, -103.3496)).toBeCloseTo(0, 3);
  });

  it('returns a plausible distance between two known ZMG points', () => {
    // Centro Historico -> Tlaquepaque, roughly 6-7km apart in reality
    const km = haversineKm(20.6597, -103.3496, 20.6432, -103.3175);
    expect(km).toBeGreaterThan(2);
    expect(km).toBeLessThan(10);
  });
});

describe('formatDistance', () => {
  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistance(0.35)).toBe('350 m');
  });

  it('formats distances >= 1km with one decimal', () => {
    expect(formatDistance(4.567)).toBe('4.6 km');
  });
});