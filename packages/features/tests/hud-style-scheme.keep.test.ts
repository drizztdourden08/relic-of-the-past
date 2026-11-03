/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { controlSchemeOf, hostDrawnHud } from '@rotp/features';
import { mergeSettings } from '@rotp/game-core';

const merge = (raw: Record<string, unknown>): Record<string, unknown> => ({ ...mergeSettings(raw) });
const EXPERIMENTAL = { developerToolsEnabled: true, experimentalFeaturesEnabled: true };

describe('hostDrawnHud answers whether the app draws this HUD', { tags: ['critical'] }, () => {
  it('is false for the game\'s own HUD and true for the app-drawn style', () => {
    expect(hostDrawnHud('vanilla')).toBe(false);
    expect(hostDrawnHud('modern')).toBe(true);
  });
});

describe('controlSchemeOf derives the scheme, which is never stored', { tags: ['critical'] }, () => {
  it('is modern for the Modern style and classic for Original', () => {
    expect(controlSchemeOf({ hudStyle: 'modern' })).toBe('modern');
    expect(controlSchemeOf({ hudStyle: 'vanilla' })).toBe('classic');
  });
});

describe('mergeSettings and the HUD style', { tags: ['critical'] }, () => {
  it('keeps each style as stored', () => {
    expect(merge({ hudStyle: 'vanilla' }).hudStyle).toBe('vanilla');
    expect(merge({ ...EXPERIMENTAL, hudStyle: 'modern' }).hudStyle).toBe('modern');
  });

  it('falls back to Original for Modern while Experimental Features is off', () => {
    expect(merge({ hudStyle: 'modern' }).hudStyle).toBe('vanilla');
  });

  it('forces the overlay on for Modern and leaves Original alone', () => {
    const modern = merge({ ...EXPERIMENTAL, hudStyle: 'modern', hudMode: 'original', hudEnhancedParts: [] });
    expect(modern.hudMode).toBe('enhanced');
    expect(modern.hudEnhancedParts).toEqual(['main', 'pause']);
    const vanilla = merge({ hudStyle: 'vanilla', hudMode: 'original', hudEnhancedParts: [] });
    expect(vanilla.hudMode).toBe('original');
  });

  it('defaults a fresh profile to Original, and therefore to Classic', () => {
    const fresh = merge({});
    expect(fresh.hudStyle).toBe('vanilla');
    expect(controlSchemeOf(fresh as never)).toBe('classic');
  });
});
