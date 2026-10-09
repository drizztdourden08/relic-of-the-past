/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { layoutHud, placedById } from '@shared/hud/engine';
import { tryLoadLayout, validateLayout } from '@shared/hud/layouts';
import type { HudContainer, HudLayout, HudNode } from '@shared/types/hud';

const VIEWS = [{ w: 398, h: 224 }, { w: 256, h: 224 }, { w: 512, h: 448 }, { w: 640, h: 240 }];

const box = (id: string): HudNode => ({
  kind: 'container', id, direction: 'row', size: { w: { px: 10 }, h: { px: 10 } }, children: [],
} as HudNode);

const docOf = (root: unknown): Record<string, unknown> => ({
  id: 'gap', name: 'Gap', builtIn: false,
  screen: {
    kind: 'container', id: 'screen', layout: 'grid',
    columns: ['auto', 'fill', 'auto'], rows: ['auto', 'fill', 'auto'],
    justifyItems: 'start', alignItems: 'start',
    children: [{ ...(root as Record<string, unknown>), place: { column: 1, row: 1 } }],
  },
});

const at = (doc: HudLayout, id: string, view = VIEWS[0]) => placedById(layoutHud(doc, view, {}), id)?.rect;

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

describe('a pre-§57 `gap: n` is REWRITTEN on load, and places to the same pixel', () => {
  const children = ['a', 'b', 'c'].map(box);
  const legacy = docOf({ kind: 'container', id: 'flow', direction: 'row', gap: 4, children });
  const rewritten = docOf({
    kind: 'container', id: 'flow', direction: 'row', gap: { x: 4, y: 4 }, children,
  });

  it('turns the one number into both axes, and keeps no alias', () => {
    const flow = loaded(legacy).screen.children[0] as HudContainer;
    expect(flow.gap).toEqual({ x: 4, y: 4 });
    expect(JSON.stringify(loaded(legacy))).toBe(JSON.stringify(loaded(rewritten)));
  });

  it('places identically to the document written the new way, at every view', () => {
    for (const view of VIEWS) {
      const before = layoutHud(loaded(legacy), view, {});
      const after = layoutHud(loaded(rewritten), view, {});
      expect(before.map((p) => [p.id, p.rect])).toEqual(after.map((p) => [p.id, p.rect]));
    }
  });

  it('places exactly where the single-gap flow always did', () => {
    const doc = loaded(legacy);
    expect(at(doc, 'b')?.x).toBe(14);
    expect(at(doc, 'c')?.x).toBe(28);
  });

  it('migrates a BOUND gap onto both axes too', () => {
    const expr = { from: 'data', expr: 'half_magic * 10' };
    const doc = loaded(docOf({
      kind: 'container', id: 'flow', direction: 'row', gap: expr, children,
    }));
    expect((doc.screen.children[0] as HudContainer).gap).toEqual({ x: expr, y: expr });
    expect(placedById(layoutHud(doc, VIEWS[0], { scope: { half_magic: 1 } }), 'b')?.rect.x).toBe(20);
  });

  it('leaves a grid\'s gap alone, and is a no-op run twice', () => {
    const grid = docOf({
      kind: 'container', id: 'flow', layout: 'grid', columns: ['auto', 'auto'],
      gap: { x: 3, y: 9 }, children,
    });
    expect((loaded(grid).screen.children[0] as HudContainer).gap).toEqual({ x: 3, y: 9 });
    const once = loaded(legacy);
    expect(loaded(JSON.parse(JSON.stringify(once)))).toEqual(once);
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
    const result = flexWith({ guide: { show: true, color: '#12ab34' } });
    expect(result.errors).toEqual([]);
    expect((result.doc?.screen.children[0] as HudContainer).guide)
      .toEqual({ show: true, color: '#12ab34' });
  });
});
