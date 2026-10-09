/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildDisplayContext, resolveShapeVibration } from '@shared/input/family';

describe('per-family vibration shaping', () => {
  it('Xbox boosts low/mid magnitudes onto a floor and clamps at 1', () => {
    const ctx = buildDisplayContext({ sdlType: 'xboxone' });
    const shapeVibration = resolveShapeVibration(ctx);
    expect(shapeVibration(0)).toBe(0);
    expect(shapeVibration(0.35)).toBeCloseTo(0.5975, 4);
    expect(shapeVibration(0.35)).toBeGreaterThan(0.35);
    expect(shapeVibration(1)).toBe(1);
    expect(shapeVibration(0.5)).toBeGreaterThan(shapeVibration(0.2));
  });

  it('Switch Pro leaves intensity untouched', () => {
    const ctx = buildDisplayContext({ sdlType: 'switch-pro' });
    const shapeVibration = resolveShapeVibration(ctx);
    expect(shapeVibration(0.35)).toBe(0.35);
    expect(shapeVibration(1)).toBe(1);
  });
});
