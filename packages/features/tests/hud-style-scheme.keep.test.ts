/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { controlSchemeOf, hostDrawnHud } from '@rotp/features';
import { mergeSettings } from '@rotp/game-core';

const merge = (raw: Record<string, unknown>): Record<string, unknown> => ({ ...mergeSettings(raw) });

describe('hostDrawnHud answers whether the app draws this HUD', () => {
  it('is false for the game\'s own HUD and true for both app-drawn styles', () => {
    expect(hostDrawnHud('vanilla')).toBe(false);
    expect(hostDrawnHud('enhanced')).toBe(true);
    expect(hostDrawnHud('modern')).toBe(true);
  });
});

describe('controlSchemeOf derives the scheme, which is never stored', () => {
  it('is modern for exactly one style, and classic for the other two', () => {
    expect(controlSchemeOf({ hudStyle: 'modern' })).toBe('modern');
    expect(controlSchemeOf({ hudStyle: 'enhanced' })).toBe('classic');
    expect(controlSchemeOf({ hudStyle: 'vanilla' })).toBe('classic');
  });
});

describe('mergeSettings and the HUD style', () => {
  it('keeps each style as stored', () => {
    for (const style of ['vanilla', 'enhanced', 'modern'])
      expect(merge({ hudStyle: style }).hudStyle).toBe(style);
  });

  it('forces the overlay on for Modern exactly as it does for Enhanced', () => {
    for (const style of ['enhanced', 'modern']) {
      const merged = merge({ hudStyle: style, hudMode: 'original', hudEnhancedParts: [] });
      expect(merged.hudMode).toBe('enhanced');
      expect(merged.hudEnhancedParts).toEqual(['main', 'pause']);
    }
    const vanilla = merge({ hudStyle: 'vanilla', hudMode: 'original', hudEnhancedParts: [] });
    expect(vanilla.hudMode).toBe('original');
  });

  it('defaults a fresh profile to Original, and therefore to Classic', () => {
    const fresh = merge({});
    expect(fresh.hudStyle).toBe('vanilla');
    expect(controlSchemeOf(fresh as never)).toBe('classic');
  });
});
