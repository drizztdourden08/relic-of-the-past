/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import { gridCellRects, layoutHud, placedById } from '@shared/hud/engine';
import type { HudGridContainer, HudLayout, HudNode } from '@shared/types/hud';

const VIEW = { w: 400, h: 200 };
const ROWS = [{ px: 20 }, { px: 20 }, { px: 20 }, { px: 20 }];

const cell = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'container', id, direction: 'row', children: [], ...extra,
} as HudNode);

const grid = (children: HudNode[], extra: Partial<HudGridContainer> = {}): HudGridContainer => ({
  kind: 'container', id: 'grid', layout: 'grid', columns: [{ px: 20 }, { px: 20 }], rows: ROWS, children, ...extra,
} as HudGridContainer);

const docOf = (root: HudGridContainer): HudLayout => ({
  id: 'test',
  name: 'Test',
  builtIn: false,
  screen: {
    kind: 'container',
    id: 'screen',
    layout: 'grid',
    columns: ['auto', 'fill', 'auto'],
    rows: ['auto', 'fill', 'auto'],
    justifyItems: 'start',
    alignItems: 'start',
    children: [{ ...root, place: { column: 1, row: 1 } }],
  },
});

const rectOf = (doc: HudLayout, id: string) => placedById(layoutHud(doc, VIEW, {}), id)?.rect;

describe('explicit place - column and row together', () => {
  it('two children may name the SAME cell, which is what an overlay is', () => {
    const at = { column: 1, row: 1 };
    const doc = docOf(grid([
      cell('under', { place: at, size: { w: { px: 20 }, h: { px: 20 } } }),
      cell('over', { place: at, size: { w: { px: 10 }, h: { px: 10 } } }),
    ]));
    expect(rectOf(doc, 'under')).toMatchObject({ x: 0, y: 0 });
    expect(rectOf(doc, 'over')).toMatchObject({ x: 0, y: 0 });
    const ids = layoutHud(doc, VIEW, {}).map((node) => node.id);
    expect(ids.indexOf('over')).toBeGreaterThan(ids.indexOf('under'));
  });

  it('an auto-flowed child still skips a cell an explicit placement took', () => {
    const doc = docOf(grid([
      cell('a', { place: { column: 1, row: 1 } }),
      cell('b', { place: { column: 1, row: 1 } }),
      cell('auto'),
    ]));
    expect(rectOf(doc, 'auto')).toMatchObject({ x: 20, y: 0 });
  });

  it('a child names its own cell, unrelated to document order', () => {
    const doc = docOf(grid([
      cell('a', { place: { column: 2, row: 1 } }),
      cell('b', { place: { column: 1, row: 1 } }),
    ]));
    expect(rectOf(doc, 'a')).toMatchObject({ x: 20, y: 0, w: 20, h: 20 });
    expect(rectOf(doc, 'b')).toMatchObject({ x: 0, y: 0, w: 20, h: 20 });
  });

  it('a partial place (column without row) is treated as no place - auto-flowed instead', () => {
    const doc = docOf(grid([cell('a', { place: { column: 2 } })]));
    expect(rectOf(doc, 'a')).toMatchObject({ x: 0, y: 0 });
  });
});

describe('auto-flow - row-major, in order, skipping explicit placements', () => {
  it('three children with no place fill the two columns left to right, top to bottom', () => {
    const doc = docOf(grid([cell('a'), cell('b'), cell('c')]));
    expect(rectOf(doc, 'a')).toMatchObject({ x: 0, y: 0 });
    expect(rectOf(doc, 'b')).toMatchObject({ x: 20, y: 0 });
    expect(rectOf(doc, 'c')).toMatchObject({ x: 0, y: 20 });
  });

  it('`order` sorts auto-flow before document order', () => {
    const doc = docOf(grid([cell('a', { order: 2 }), cell('b', { order: 1 })]));
    expect(rectOf(doc, 'b')).toMatchObject({ x: 0 });
    expect(rectOf(doc, 'a')).toMatchObject({ x: 20 });
  });

  it('auto-flow skips a cell an explicit placement already occupies', () => {
    const doc = docOf(grid([cell('claims-first', { place: { column: 1, row: 1 } }), cell('auto')]));
    expect(rectOf(doc, 'auto')).toMatchObject({ x: 20, y: 0 });
  });
});

describe('spans', () => {
  it('a colSpan of 2 covers both column tracks', () => {
    const doc = docOf(grid([cell('a', { place: { column: 1, row: 1, colSpan: 2 } })]));
    expect(rectOf(doc, 'a')?.w).toBe(40);
  });

  it('implicit rows are exactly as many as an auto-flow needs', () => {
    const withHeight = (id: string, extra: Partial<HudNode> = {}): HudNode =>
      cell(id, { size: { h: { px: 20 } }, ...extra });
    const doc = docOf(grid(
      [withHeight('a'), withHeight('b'), withHeight('c'), withHeight('d'), withHeight('e')],
      { rows: undefined },
    ));
    expect(rectOf(doc, 'e')).toMatchObject({ x: 0, y: 40 });
  });
});

describe('fill tracks and gaps', () => {
  it('a fill column shares whatever the fixed columns leave, and gap.x separates them', () => {
    const doc = docOf(grid([cell('a'), cell('b')], {
      columns: [{ px: 20 }, 'fill'], gap: { x: 4 }, size: { w: { px: 100 } },
    }));
    expect(rectOf(doc, 'a')).toMatchObject({ x: 0, w: 20 });
    expect(rectOf(doc, 'b')).toMatchObject({ x: 24, w: 76 });
  });
});

describe('alignment - justifyItems, alignItems and a per-child alignSelf', () => {
  it('stretch (the default) fills the whole cell', () => {
    const doc = docOf(grid([cell('a')], { rows: [{ px: 30 }] }));
    expect(rectOf(doc, 'a')).toMatchObject({ w: 20, h: 30 });
  });

  it('an explicit child size is centred in its cell when justifyItems is center', () => {
    const doc = docOf(grid([cell('a', { size: { w: { px: 10 } } })], { justifyItems: 'center' }));
    expect(rectOf(doc, 'a')?.x).toBe(5);
  });

  it('alignSelf overrides the container default for one child only', () => {
    const doc = docOf(grid([
      cell('a', { size: { w: { px: 10 }, h: { px: 20 } }, alignSelf: 'end' }),
      cell('b', { size: { w: { px: 10 } }, place: { column: 2, row: 1 } }),
    ], { justifyItems: 'start' }));
    expect(rectOf(doc, 'a')?.x).toBe(10);
    expect(rectOf(doc, 'b')?.x).toBe(20);
  });
});

describe('a zero-size resolved child leaves the flow, matching the flex engine', () => {
  it('min/max apply to a grid child exactly as they do to a flex one', () => {
    const doc = docOf(grid([cell('a', { size: { w: { px: 5 } }, min: { w: 15 } })]));
    expect(rectOf(doc, 'a')?.w).toBe(15);
  });
});

describe('every cell of a placed grid, empty ones included', () => {
  const cells = (root: HudGridContainer) => {
    const doc = docOf(root);
    const placed = placedById(layoutHud(doc, VIEW, {}), 'grid');
    return gridCellRects(placed?.node as HudGridContainer, placed!.rect, placed!.scale, {});
  };

  it('answers a rectangle for a cell no child is in', () => {
    const found = cells(grid([cell('a', { place: { column: 1, row: 1 }, size: { w: { px: 20 }, h: { px: 20 } } })]));
    expect(found.filter((c) => !c.implicit)).toHaveLength(8);
    expect(found.find((c) => c.column === 2 && c.row === 3)?.rect).toMatchObject({ w: 20, h: 20 });
  });

  it('solves the same tracks the children were placed by, never a second lattice', () => {
    const root = grid([
      cell('a', { place: { column: 1, row: 1 }, size: { w: { px: 20 }, h: { px: 20 } } }),
      cell('b', { place: { column: 2, row: 2 }, size: { w: { px: 20 }, h: { px: 20 } } }),
    ]);
    const found = cells(root);
    const doc = docOf(root);
    expect(found.find((c) => c.column === 2 && c.row === 2)?.rect)
      .toMatchObject({ x: rectOf(doc, 'b')!.x, y: rectOf(doc, 'b')!.y });
  });

  it('offers ONE implicit row past the last and never a fourth column', () => {
    const found = cells(grid(
      [cell('a', { size: { w: { px: 20 }, h: { px: 20 } } })],
      { rows: [{ px: 20 }], size: { h: { px: 60 } } },
    ));
    expect(new Set(found.map((c) => c.column))).toEqual(new Set([1, 2]));
    expect(found.filter((c) => c.implicit).map((c) => c.row)).toEqual([2, 2]);
  });
});
