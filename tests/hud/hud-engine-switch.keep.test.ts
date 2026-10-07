/* @layer test @kind test */
/**
 * Switching a container's engine CONVERTS it, and cannot crash the editor.
 *
 * THE BUG. The editor applies edits through `patchNode`, which shallow-merges.
 * The switch handed it a freshly built flex container, so a grid was not
 * replaced - `layout: 'flex'` was laid over it, leaving `columns`, `rows`,
 * `justifyItems`, `alignItems` (unsavable: the validator refuses them) and a
 * grid's `gap: { x, y }` where flex reads one `Value`. `resolveValue` then read
 * `.expr` off an object that had none and threw inside the layout pass; nothing
 * sits above the stage to catch it, so clicking "flex" took the editor down.
 * It needed only a gap to have been set first.
 *
 * Both halves are pinned: the conversion leaves nothing of the other engine
 * behind, and the resolver keeps its own "never throws" promise even when
 * handed the malformed shape - so the NEXT merge bug costs a wrong gap, not
 * the screen.
 *
 * SINCE §57 THE FIRST HALF HAS LESS TO DO. `gap` is `{ x, y }` under BOTH
 * engines and `guide` belongs to any container, so neither is converted and
 * neither is dropped - they pass straight through, in both directions. The
 * crash above cannot be re-created by a gap at all; the malformed-shape cases
 * at the foot of this file are what still stand between a future merge bug and
 * the editor.
 */
import { describe, expect, it } from 'vitest';
import { layoutHud } from '../../shared/hud/engine';
import { validateLayout } from '../../shared/hud/layouts';
import { BUILT_IN_LAYOUTS } from '../../shared/hud/layouts/built-in-layouts';
import { engineSwitchPatch } from '../../shared/hud/layouts/convert-engine';
import { resolveValue } from '../../shared/hud/data/resolve-value';
import { nodeById, patchNode } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/node-edits';
import type { HudContainer, HudLayout } from '../../shared/types/hud';
import type { Value } from '../../shared/types/hud/hud-value';

const VIEW = { w: 398, h: 224 };
const base = BUILT_IN_LAYOUTS[0];

const screenOf = (doc: HudLayout): HudContainer => nodeById(doc, doc.screen.id) as HudContainer;

const switched = (doc: HudLayout, engine: 'flex' | 'grid'): HudLayout => {
  const patch = engineSwitchPatch(screenOf(doc), engine);
  return patch ? patchNode(doc, doc.screen.id, patch as never) : doc;
};

describe('grid -> flex, with the gap that used to crash it', () => {
  const withGap = patchNode(base, base.screen.id, { gap: { x: 2, y: 3 } } as never);
  const flex = switched(withGap, 'flex');
  const node = screenOf(flex) as unknown as Record<string, unknown>;

  it('leaves nothing of the grid behind', () => {
    // `guide` is NOT in this list since §57: it is a CONTAINER's overlay colour,
    // not a grid's, and the stage draws a flex container's slots in it too.
    for (const key of ['columns', 'rows', 'justifyItems', 'alignItems']) {
      expect(key in node, `${key} should be gone`).toBe(false);
    }
    expect(node.layout).toBe('flex');
  });

  it('passes the gap straight through - both axes, untouched (§57)', () => {
    // There is no longer a key the two engines spell differently. `x` is
    // horizontal and `y` vertical under flex as well, so a row that was a grid
    // keeps the SAME two numbers instead of collapsing to the one along its
    // flow: nothing is lost, and flipping back restores the grid exactly.
    expect(node.direction).toBe('row');
    expect(node.gap).toEqual({ x: 2, y: 3 });
  });

  it('carries the guide colour across, because it is not the grid\'s', () => {
    const withGuide = patchNode(base, base.screen.id, { guide: { show: true, color: '#abcdef' } } as never);
    const asFlex = screenOf(switched(withGuide, 'flex')) as unknown as Record<string, unknown>;
    expect(asFlex.guide).toEqual({ show: true, color: '#abcdef' });
    expect(validateLayout(JSON.parse(JSON.stringify(switched(withGuide, 'flex')))).errors).toEqual([]);
  });

  it('lays out without throwing - this is the crash', () => {
    expect(() => layoutHud(flex, VIEW, {})).not.toThrow();
  });

  it('is a document the validator accepts, so it can still be saved', () => {
    expect(validateLayout(JSON.parse(JSON.stringify(flex))).errors).toEqual([]);
  });
});

describe('flex -> grid, and back again', () => {
  const flex = switched(base, 'flex');
  const grid = switched(flex, 'grid');
  const node = screenOf(grid) as unknown as Record<string, unknown>;

  it('leaves nothing of flex behind', () => {
    for (const key of ['direction', 'justify', 'align', 'wrap']) {
      expect(key in node, `${key} should be gone`).toBe(false);
    }
    expect(node.layout).toBe('grid');
  });

  it('never strands a child outside the new grid', () => {
    // The screen's children still name column 3 from before the round trip.
    expect((node.columns as unknown[]).length).toBeGreaterThanOrEqual(3);
    expect(validateLayout(JSON.parse(JSON.stringify(grid))).errors).toEqual([]);
    expect(() => layoutHud(grid, VIEW, {})).not.toThrow();
  });

  it('passes a flex gap straight through to the grid (§57)', () => {
    // A flex gap IS `{ x, y }` now, so the conversion has nothing to reshape:
    // the pair arrives as it left, both axes intact.
    const gapped = patchNode(flex, flex.screen.id, { gap: { x: 4, y: 6 } } as never);
    expect((screenOf(switched(gapped, 'grid')) as unknown as Record<string, unknown>).gap).toEqual({ x: 4, y: 6 });
  });

  it('writes nothing when asked for the engine it already has', () => {
    expect(engineSwitchPatch(screenOf(base), 'grid')).toBeNull();
  });
});

describe('resolveValue keeps its own promise', () => {
  it.each([
    ['a grid gap object', { x: 2, y: 2 }],
    ['an empty object', {}],
    ['null', null],
    ['a data value with no expr', { from: 'data' }],
    ['a string', '4'],
  ])('folds %s to 0 instead of throwing into the layout pass', (_name, bad) => {
    expect(() => resolveValue(bad as unknown as Value, {})).not.toThrow();
    expect(resolveValue(bad as unknown as Value, {})).toBe(0);
  });
});
