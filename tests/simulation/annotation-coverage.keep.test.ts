/* @layer tests @kind test */
/**
 * Phase 2 renders a GENERATED annotation list, so a new mechanic could produce
 * a kind nothing draws. These make that a build failure: every AnnotationKind
 * has a style + legend, and the derivation's kinds are all renderable.
 */
import { describe, it, expect } from 'vitest';
import { ANNOTATION_STYLES, DRAWN_KINDS } from '../../apps/web/src/ui/domains/app/views/GameLayer/sub-components/navigation-overlay/annotation-style';
import type { AnnotationKind } from '../../shared/game/simulation';

/** Mirrors the AnnotationKind union (a type cannot be enumerated at runtime). Adding a kind without adding it here fails the count. */
const EXPECTED_KINDS: AnnotationKind[] = [
  'chest', 'big-chest', 'npc-check', 'standing-item',
  'key-door', 'big-key-door', 'cell-lock', 'shutter', 'bombable', 'follower-gate',
  'pull-switch', 'kill-trigger', 'key-carrier', 'big-key-carrier',
  'warp-door', 'exit-door', 'exit',
  'unknown',
];

describe('annotation coverage', () => {
  it('every kind has a style, a glyph and legend text', () => {
    for (const kind of EXPECTED_KINDS) {
      const style = ANNOTATION_STYLES[kind];
      expect(style, `no style registered for "${kind}"`).toBeDefined();
      expect(style.glyph, `"${kind}" has an empty glyph`).toBeTruthy();
      expect(style.legend, `"${kind}" has no legend text`).toBeTruthy();
      expect(style.color, `"${kind}" has no colour`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('the style registry has no kinds beyond the union, and none missing', () => {
    expect(Object.keys(ANNOTATION_STYLES).sort()).toEqual([...EXPECTED_KINDS].sort());
  });

  it('always keeps an "unknown" fallback so a new mechanic cannot draw nothing', () => {
    expect(ANNOTATION_STYLES.unknown).toBeDefined();
    expect(DRAWN_KINDS).toContain('unknown');
  });

  it('screen-wide kinds are panel-only, not dropped', () => {
    // kill-trigger describes the whole room, so it has no meaningful tile; it must
    // be marked panelOnly instead of silently skipped by the canvas.
    expect(ANNOTATION_STYLES['kill-trigger'].panelOnly).toBe(true);
    expect(DRAWN_KINDS).not.toContain('kill-trigger');
  });

  it('lock-like kinds share the lock colour so state reads at a glance', () => {
    const lockColor = ANNOTATION_STYLES['key-door'].color;
    for (const kind of ['big-key-door', 'cell-lock', 'shutter', 'bombable', 'follower-gate'] as AnnotationKind[]) {
      expect(ANNOTATION_STYLES[kind].color, `"${kind}" should use the lock colour`).toBe(lockColor);
    }
  });
});
