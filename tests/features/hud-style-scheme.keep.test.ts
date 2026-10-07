/* @layer tests @kind test */
/**
 * THE HUD STYLE IS THE ONE CHOICE, and the control scheme follows from it.
 *
 * Three things are worth pinning down here, because none is visible at the type
 * level: the derivation itself (`controlSchemeOf` / `hostDrawnHud`), the
 * one-way migration that retires the old `controlScheme` key, and the VALUE
 * rename that made `hudStyle` spell the word the settings screen shows (§59.7).
 *
 * The two migrations share one condition and run on every profile read, so they
 * have to be idempotent AND exact. The worst outcome is not an error: it is a
 * profile that silently loses the modern scheme it was saved with, or one that
 * lands on Enhanced when the player had picked Modern.
 */
import { describe, it, expect } from 'vitest';
import { controlSchemeOf, hostDrawnHud } from '../../shared/features/hud-style';
import { mergeSettings } from '../../apps/web/src/lib/game/settings';

/** A stored profile as it exists on disk before §59: the two old keys, loose. */
const storedProfile = (controlScheme: string, hudStyle: string): Record<string, unknown> => ({
  hudStyle,
  controlScheme,
  mapOnSelect: false,
  modernScheme: { assignments: { 1: { kind: 'sword' }, 2: { kind: 'action' } } },
});

const merge = (raw: Record<string, unknown>) => mergeSettings(raw as never) as unknown as Record<string, unknown>;

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

  it('reads nothing but the style, so a leftover controlScheme key cannot change it', () => {
    const settings = { hudStyle: 'enhanced', controlScheme: 'modern' } as never;
    expect(controlSchemeOf(settings)).toBe('classic');
  });
});

describe('mergeSettings applies the value rename (§59.7)', () => {
  it('rewrites a stored `extended` to `enhanced`', () => {
    expect(merge(storedProfile('classic', 'extended')).hudStyle).toBe('enhanced');
    expect(merge({ hudStyle: 'extended' }).hudStyle).toBe('enhanced');
  });

  it('leaves an already-renamed profile alone', () => {
    expect(merge(storedProfile('classic', 'enhanced')).hudStyle).toBe('enhanced');
    expect(merge({ hudStyle: 'enhanced' }).hudStyle).toBe('enhanced');
  });

  it('never touches the other two styles', () => {
    expect(merge({ hudStyle: 'vanilla' }).hudStyle).toBe('vanilla');
    expect(merge({ hudStyle: 'modern' }).hudStyle).toBe('modern');
  });

  it('is idempotent, so re-reading a migrated profile lands on the same value', () => {
    const once = merge({ hudStyle: 'extended' });
    expect(merge(once).hudStyle).toBe('enhanced');
  });
});

describe('mergeSettings retires the controlScheme key', () => {
  it('folds modern + the old `extended` spelling into the Modern style, assignments intact', () => {
    const merged = merge(storedProfile('modern', 'extended'));
    expect(merged.hudStyle).toBe('modern');
    expect(merged.modernScheme).toEqual({ assignments: { 1: { kind: 'sword' }, 2: { kind: 'action' } } });
    expect(controlSchemeOf(merged as never)).toBe('modern');
  });

  it('strips the key in every case, so it stops round-tripping through saved profiles', () => {
    for (const raw of [
      storedProfile('modern', 'extended'),
      storedProfile('classic', 'extended'),
      storedProfile('classic', 'vanilla'),
      storedProfile('modern', 'vanilla'),
      storedProfile('modern', 'enhanced'),
    ]) expect('controlScheme' in merge(raw)).toBe(false);
  });

  it('does NOT promote Original: modern-on-Original was never reachable, so it is not a choice', () => {
    expect(merge(storedProfile('modern', 'vanilla')).hudStyle).toBe('vanilla');
  });

  it('does NOT promote a post-rename Enhanced profile, because only the old spelling carried a scheme', () => {
    // A profile written after §59 has no `controlScheme` at all; one that somehow
    // carries both is already past the collapse and must not be moved again.
    expect(merge(storedProfile('modern', 'enhanced')).hudStyle).toBe('enhanced');
  });

  it('is idempotent, so a re-read of the migrated profile lands on the same style', () => {
    const once = merge(storedProfile('modern', 'extended'));
    const twice = merge(once);
    expect(twice.hudStyle).toBe('modern');
    expect('controlScheme' in twice).toBe(false);
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
