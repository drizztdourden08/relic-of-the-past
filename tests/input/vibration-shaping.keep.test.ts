/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { findControllerById } from '@shared/input/register-all';

// Per-controller strength shaping compensates for how each pad's rumble tech feels. Xbox
// dual-rumble is linear and soft at low magnitudes, so it boosts; Switch HD-rumble buckets
// already feel strong, so it stays identity. Shaping only touches magnitude, never duration.

describe('per-controller vibration shaping', () => {
  it('Xbox boosts low/mid magnitudes onto a floor and clamps at 1', () => {
    const xbox = findControllerById('xbox')!;
    expect(xbox.shapeVibration(0)).toBe(0);
    expect(xbox.shapeVibration(0.35)).toBeCloseTo(0.5975, 4); // faint sword swing → punchy
    expect(xbox.shapeVibration(0.35)).toBeGreaterThan(0.35);
    expect(xbox.shapeVibration(1)).toBe(1); // 0.3 + 0.85 = 1.15, clamped
    expect(xbox.shapeVibration(0.5)).toBeGreaterThan(xbox.shapeVibration(0.2)); // monotonic
  });

  it('Switch Pro 2 leaves intensity untouched', () => {
    const spc2 = findControllerById('switch-pro-2')!;
    expect(spc2.shapeVibration(0.35)).toBe(0.35);
    expect(spc2.shapeVibration(1)).toBe(1);
  });
});
