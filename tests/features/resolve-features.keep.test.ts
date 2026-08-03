/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveFeatures, requirementClosure, suggestionsFor } from '../../shared/features/resolve-features';
import { FEATURES_BY_ID } from '../../shared/features/feature-registry';

// Locks the rendering dependency tree (plans/settings-registry-map.md §4). The resolver is the single
// source of truth for "X requires Y": a child can never resolve on while its parent is off, in any order.
// Tree: extendedRendering → linearWorldTilemap → {ultrawideRendering, tallRendering};
//       cameraLockToViewport → extendedRendering; smoothTransitions → cameraLockToViewport.

describe('resolveFeatures — requirement pruning', () => {
  it('drops a child whose requirement is missing', () => {
    const { effective, autoDisabled } = resolveFeatures(['cameraLockToViewport']);
    expect(effective.has('cameraLockToViewport')).toBe(false);
    expect(autoDisabled).toEqual([{ id: 'cameraLockToViewport', missing: ['extendedRendering'] }]);
  });

  it('keeps a child when its requirement is also on', () => {
    const { effective } = resolveFeatures(['extendedRendering', 'cameraLockToViewport']);
    expect(effective.has('cameraLockToViewport')).toBe(true);
    expect(effective.has('extendedRendering')).toBe(true);
  });

  it('prunes to a fixpoint — disabling the root cascades to grandchildren', () => {
    // tallRendering → linearWorldTilemap → extendedRendering. Without the root the whole chain collapses.
    const { effective } = resolveFeatures(['linearWorldTilemap', 'tallRendering']);
    expect(effective.size).toBe(0);
  });

  it('keeps a deep chain when every ancestor is present', () => {
    const { effective } = resolveFeatures(['extendedRendering', 'linearWorldTilemap', 'ultrawideRendering']);
    expect(effective.has('ultrawideRendering')).toBe(true);
  });

  it('leaves unknown ids untouched (forward-compatible)', () => {
    const { effective } = resolveFeatures(['notAFeatureYet']);
    expect(effective.has('notAFeatureYet')).toBe(true);
  });
});

describe('requirementClosure / suggestionsFor', () => {
  it('returns the transitive requirements not yet enabled', () => {
    const ids = requirementClosure('tallRendering', new Set()).map((d) => d.id);
    expect(ids).toContain('linearWorldTilemap');
    expect(ids).toContain('extendedRendering');
  });

  it('omits requirements already enabled', () => {
    const ids = requirementClosure('tallRendering', new Set(['extendedRendering'])).map((d) => d.id);
    expect(ids).toContain('linearWorldTilemap');
    expect(ids).not.toContain('extendedRendering');
  });

  it('offers soft companions that are registered and not already on', () => {
    const ids = suggestionsFor('extendedRendering', new Set()).map((d) => d.id);
    expect(ids).toContain('cameraLockToViewport');
    for (const id of ids) expect(FEATURES_BY_ID[id]).toBeDefined();
  });
});
