/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { layoutHud, validateLayout, BUILT_IN_LAYOUTS, engineSwitchPatch, resolveValue } from '@rotp/hud';
import { nodeById, patchNode } from '@app/hud-layout-editing/node-edits';
import type { HudContainer, HudLayout, Value } from '@rotp/hud';
import { required } from '../required';

const VIEW = { w: 398, h: 224 };
const base = required(BUILT_IN_LAYOUTS[0], 'the first built-in layout');

const screenOf = (doc: HudLayout): HudContainer => nodeById(doc, doc.screen.id) as HudContainer;

const switched = (doc: HudLayout, engine: 'flex' | 'grid'): HudLayout => {
  const patch = engineSwitchPatch(screenOf(doc), engine);
  return patch ? patchNode(doc, doc.screen.id, patch) : doc;
};

describe('grid -> flex, with the gap that used to crash it', () => {
  const withGap = patchNode(base, base.screen.id, { gap: { x: 2, y: 3 } });
  const flex = switched(withGap, 'flex');
  const node = screenOf(flex) as unknown as Record<string, unknown>;

  it('leaves nothing of the grid behind', () => {
    for (const key of ['columns', 'rows', 'justifyItems', 'alignItems']) {
      expect(key in node, `${key} should be gone`).toBe(false);
    }
    expect(node.layout).toBe('flex');
  });

  it('passes the gap straight through - both axes, untouched (§57)', () => {
    expect(node.direction).toBe('row');
    expect(node.gap).toEqual({ x: 2, y: 3 });
  });

  it('carries the guide colour across, because it is not the grid\'s', () => {
    const withGuide = patchNode(base, base.screen.id, { guide: { show: true, color: '#abcdef' } });
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
    expect((node.columns as unknown[]).length).toBeGreaterThanOrEqual(3);
    expect(validateLayout(JSON.parse(JSON.stringify(grid))).errors).toEqual([]);
    expect(() => layoutHud(grid, VIEW, {})).not.toThrow();
  });

  it('passes a flex gap straight through to the grid (§57)', () => {
    const gapped = patchNode(flex, flex.screen.id, { gap: { x: 4, y: 6 } });
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
