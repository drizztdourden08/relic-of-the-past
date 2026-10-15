/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { layoutHud, placedById, tryLoadLayout, validateLayout } from '@rotp/hud';
import type { HudContainer, HudLayout, HudNode } from '@rotp/hud';
import { required } from '../required';
import { FIXTURE_COLOURS } from './fixture-colours.constants';

const VIEWS = [{ w: 398, h: 224 }, { w: 256, h: 224 }, { w: 512, h: 448 }, { w: 640, h: 240 }];

const box = (id: string): HudNode => ({
  kind: 'container', id, direction: 'row', size: { w: { px: 10 }, h: { px: 10 } }, children: [],
});

const docOf = (root: unknown): Record<string, unknown> => ({
  id: 'gap', name: 'Gap', builtIn: false,
  screen: {
    kind: 'container', id: 'screen', layout: 'grid',
    columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
    justifyItems: 'start', alignItems: 'start',
    children: [{ ...(root as Record<string, unknown>), place: { column: 1, row: 1 } }],
  },
});

const DEFAULT_VIEW = required(VIEWS[0], 'the default view');

const at = (doc: HudLayout, id: string, view = DEFAULT_VIEW) => placedById(layoutHud(doc, view, {}), id)?.rect;

const loaded = (raw: unknown): HudLayout => {
  const result = tryLoadLayout(raw);
  if (!result.ok) throw new Error(result.errors.join('\n'));
  return result.doc;
};

describe('the two axes are independent, and `x` is always horizontal', () => {
  const wrapping = (direction: 'row' | 'column'): HudLayout => loaded(docOf({
    kind: 'container', id: 'flow', direction, wrap: true,
    gap: { x: 2, y: 6 },
    size: direction === 'row' ? { w: { px: 22 } } : { h: { px: 26 } },
    children: ['a', 'b', 'c', 'd'].map(box),
  }));

  it('a wrapping ROW puts its items 2 apart and its lines 6 apart', () => {
    const doc = wrapping('row');
    expect(at(doc, 'a')).toEqual({ x: 0, y: 0, w: 10, h: 10 });
    expect(at(doc, 'b')).toEqual({ x: 12, y: 0, w: 10, h: 10 });
    expect(at(doc, 'c')).toEqual({ x: 0, y: 16, w: 10, h: 10 });
    expect(at(doc, 'd')).toEqual({ x: 12, y: 16, w: 10, h: 10 });
  });

  it('a COLUMN swaps which gap does which job, and nothing else changes', () => {
    const doc = wrapping('column');
    expect(at(doc, 'a')).toEqual({ x: 0, y: 0, w: 10, h: 10 });
    expect(at(doc, 'b')).toEqual({ x: 0, y: 16, w: 10, h: 10 });
    expect(at(doc, 'c')).toEqual({ x: 12, y: 0, w: 10, h: 10 });
    expect(at(doc, 'd')).toEqual({ x: 12, y: 16, w: 10, h: 10 });
  });

  it('spends only the item gap when there is one line to spend it on', () => {
    const doc = loaded(docOf({
      kind: 'container', id: 'flow', direction: 'row', gap: { x: 2, y: 6 },
      children: ['a', 'b', 'c'].map(box),
    }));
    expect(at(doc, 'flow')).toEqual({ x: 0, y: 0, w: 34, h: 10 });
    expect(at(doc, 'c')?.x).toBe(24);
  });
});

describe('gap placement and the grid gap', () => {
  const children = ['a', 'b', 'c'].map(box);

  it('places a flow by its pair gap, a bound gap included', () => {
    const expr = { from: 'data', expr: 'half_magic * 10' };
    const doc = loaded(docOf({
      kind: 'container', id: 'flow', direction: 'row', gap: { x: expr, y: expr }, children,
    }));
    expect(placedById(layoutHud(doc, DEFAULT_VIEW, { scope: { half_magic: 1 } }), 'b')?.rect.x).toBe(20);
  });

  it('keeps a grid\'s gap as written', () => {
    const grid = docOf({
      kind: 'container', id: 'flow', layout: 'grid', columns: ['auto', 'auto'],
      gap: { x: 3, y: 9 }, children,
    });
    expect((loaded(grid).screen.children[0] as HudContainer).gap).toEqual({ x: 3, y: 9 });
  });
});

describe('the validator knows one gap shape and one guide, for both engines', () => {
  const flexWith = (extra: Record<string, unknown>) => validateLayout(docOf({
    kind: 'container', id: 'flow', direction: 'row', children: [box('a')], ...extra,
  }));

  it('refuses a bare number on a flex container - no alias survives', () => {
    expect(flexWith({ gap: 4 }).errors)
      .toContain('layout.screen.children[0].gap: expected { x?, y? }');
  });

  it('accepts the pair, and refuses a negative axis', () => {
    expect(flexWith({ gap: { x: 2, y: 6 } }).errors).toEqual([]);
    expect(flexWith({ gap: { x: -1 } }).errors)
      .toContain('layout.screen.children[0].gap.x: a gap cannot be negative');
  });

  it('accepts a guide on a FLEX container, because the overlay draws one', () => {
    const result = flexWith({ guide: { show: true, color: FIXTURE_COLOURS.guideGreen } });
    expect(result.errors).toEqual([]);
    expect((result.doc?.screen.children[0] as HudContainer).guide)
      .toEqual({ show: true, color: FIXTURE_COLOURS.guideGreen });
  });
});
