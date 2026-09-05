/* @layer test @kind test */
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { GameSettings } from '@shared/types/settings';
import { validateCustomRatio, detectScreenRatio, MAX_ASPECT } from '../../apps/web/src/lib/game/aspect-ratio';
import { mergeSettings } from '../../apps/web/src/lib/game/settings';

describe('validateCustomRatio', () => {
  it('accepts ratios from 4:3 up to the wide ceiling', () => {
    expect(validateCustomRatio(4, 3).valid).toBe(true);
    expect(validateCustomRatio(16, 9).valid).toBe(true);
    expect(validateCustomRatio(32, 9).valid).toBe(true); // 3.56, still within the ~4.27 (1024px linear-world) cap
  });

  it('accepts tall (taller-than-4:3) ratios down to the portrait floor', () => {
    expect(validateCustomRatio(5, 4).valid).toBe(true); // 1.25
    expect(validateCustomRatio(1, 1).valid).toBe(true); // square
    expect(validateCustomRatio(3, 4).valid).toBe(true); // 0.75 portrait
    expect(validateCustomRatio(9, 16).valid).toBe(true); // 0.5625, still within the 256/480 floor
  });

  it('rejects ratios taller than the portrait floor', () => {
    const r = validateCustomRatio(1, 2); // 0.5 < 256/480 ≈ 0.533
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/tall/i);
  });

  it('rejects ratios wider than the max', () => {
    expect(validateCustomRatio(9, 2).valid).toBe(false); // 4.5 > ~4.27
    expect(validateCustomRatio(5, 1).valid).toBe(false); // 5.0
  });

  it('rejects non-integer or non-positive input', () => {
    expect(validateCustomRatio(16.5, 9).valid).toBe(false);
    expect(validateCustomRatio(0, 9).valid).toBe(false);
    expect(validateCustomRatio(Number.NaN, 9).valid).toBe(false);
  });
});

describe('detectScreenRatio', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('GCD-reduces a landscape phone screen', () => {
    vi.stubGlobal('window', { screen: { width: 1920, height: 1080 } });
    expect(detectScreenRatio()).toEqual({ w: 16, h: 9 });
  });

  it('normalizes a portrait screen to its landscape ratio', () => {
    vi.stubGlobal('window', { screen: { width: 1080, height: 1920 } });
    expect(detectScreenRatio()).toEqual({ w: 16, h: 9 });
  });

  it('renders a 5:4 screen at its own (mildly tall) ratio', () => {
    vi.stubGlobal('window', { screen: { width: 1280, height: 1024 } }); // 1.25, now filled instead of clamped to 4:3
    expect(detectScreenRatio()).toEqual({ w: 5, h: 4 });
  });

  it('clamps ultra-wide screens to the max', () => {
    vi.stubGlobal('window', { screen: { width: 5120, height: 1080 } }); // 4.74
    const { w, h } = detectScreenRatio();
    expect(w / h).toBeLessThanOrEqual(MAX_ASPECT + 1e-6);
  });
});

describe('mergeSettings and the 18:9 migration', () => {
  it('rewrites a stored 18:9 screen ratio to custom 18:9', () => {
    const m = mergeSettings({ aspectRatio: '18:9' } as unknown as Partial<GameSettings>);
    expect(m.aspectRatio).toBe('custom');
    expect(m.customAspectW).toBe(18);
    expect(m.customAspectH).toBe(9);
  });

  it('rewrites a stored 18:9 HUD ratio to custom 18:9', () => {
    const m = mergeSettings({ hudRatio: '18:9' } as unknown as Partial<GameSettings>);
    expect(m.hudRatio).toBe('custom');
    expect(m.customHudAspectW).toBe(18);
    expect(m.customHudAspectH).toBe(9);
  });
});
