/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildDisplayContext, resolveShapeVibration } from '@shared/input/family';

// Per-family strength shaping compensates for how each pad's rumble tech feels. Xbox
// dual-rumble is linear and soft at low magnitudes, so it boosts; Switch HD-rumble buckets
// already feel strong, so it stays identity. Shaping only touches magnitude, never duration.

describe('per-family vibration shaping', () => {
  it('Xbox boosts low/mid magnitudes onto a floor and clamps at 1', () => {
    const ctx = buildDisplayContext({ sdlType: 'xboxone' });
    const shapeVibration = resolveShapeVibration(ctx);
    expect(shapeVibration(0)).toBe(0);
    expect(shapeVibration(0.35)).toBeCloseTo(0.5975, 4); // faint sword swing → punchy
    expect(shapeVibration(0.35)).toBeGreaterThan(0.35);
    expect(shapeVibration(1)).toBe(1); // 0.3 + 0.85 = 1.15, clamped
    expect(shapeVibration(0.5)).toBeGreaterThan(shapeVibration(0.2)); // monotonic
  });

  it('Switch Pro leaves intensity untouched', () => {
    const ctx = buildDisplayContext({ sdlType: 'switch-pro' });
    const shapeVibration = resolveShapeVibration(ctx);
    expect(shapeVibration(0.35)).toBe(0.35);
    expect(shapeVibration(1)).toBe(1);
  });
});
