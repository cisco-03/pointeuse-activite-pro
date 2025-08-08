// Tests unitaires pour formatTime
import { describe, it, expect } from 'vitest';
import { formatTime } from '../App';

describe('formatTime', () => {
  it('formate 0 ms en 00:00:00.000', () => {
    expect(formatTime(0)).toBe('00:00:00.000');
  });
  it('formate 1 234 567 ms correctement', () => {
    expect(formatTime(1_234_567)).toBe('00:20:34.567');
  });
  it('formate plus de 1 heure', () => {
    expect(formatTime(3_660_001)).toBe('01:01:00.001');
  });
});

