/* @layer test @kind test */
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { GameSettings } from '@shared/types/settings';
import { validateCustomRatio, detectScreenRatio, MAX_ASPECT } from '../../apps/web/src/lib/game/aspect-ratio';
import { mergeSettings } from '../../apps/web/src/lib/game/settings';

describe('validateCustomRatio', () => {
  it('accepts ratios from 4:3 up to the wide ceiling', () => {
    expect(validateCustomRatio(4, 3).valid).toBe(true);
    expect(validateCustomRatio(16, 9).valid).toBe(true);
    expect(validateCustomRatio(19, 9).valid).toBe(true); // 2.11 — within the ~2.13 (512px tilemap) cap
  });

  it('rejects ratios taller than 4:3', () => {
    const r = validateCustomRatio(5, 4); // 1.25 < 1.333
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/taller/i);
  });

  it('rejects ratios wider than the max', () => {
    expect(validateCustomRatio(21, 9).valid).toBe(false); // 2.33 > ~2.13
    expect(validateCustomRatio(32, 9).valid).toBe(false);
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

  it('clamps taller-than-4:3 screens to 4:3', () => {
    vi.stubGlobal('window', { screen: { width: 1280, height: 1024 } }); // 1.25
    expect(detectScreenRatio()).toEqual({ w: 4, h: 3 });
  });

  it('clamps ultra-wide screens to the max', () => {
    vi.stubGlobal('window', { screen: { width: 5120, height: 1080 } }); // 4.74
    const { w, h } = detectScreenRatio();
    expect(w / h).toBeLessThanOrEqual(MAX_ASPECT + 1e-6);
  });
});

describe('mergeSettings — 18:9 migration', () => {
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
