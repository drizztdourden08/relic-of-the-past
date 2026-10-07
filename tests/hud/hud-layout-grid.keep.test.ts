/* @layer test @kind test */
/**
 * Phase 4 of `plans/hud-data-binding.html`: the grid placement engine, beside
 * the flex flow. `place-grid.ts` / `grid-cells.ts` own the arithmetic; this
 * proves the rules their own comments claim - explicit placement, auto-flow,
 * spans, `fill` tracks, and per-item alignment.
 *
 * Every test row template is explicit (`rows: [...]`) unless a test is
 * specifically about IMPLICIT rows: a childless cell's natural content is
 * 0x0, so an `auto` row measured off empty test fixtures would resolve to
 * zero height and the cell would leave the flow before there was anything to
 * assert about its position - the same "a zero box leaves the flow" rule
 * `hud-layout-bindable.keep.test.ts` proves on purpose, here an artefact of
 * the fixture, not the thing under test.
 */
import { describe, expect, it } from 'vitest';
import { gridCellRects, layoutHud, placedById } from '@shared/hud/engine';
import type { HudGridContainer, HudLayout, HudNode } from '@shared/types/hud';

const VIEW = { w: 400, h: 200 };
const ROWS = [{ px: 20 }, { px: 20 }, { px: 20 }, { px: 20 }];

/** A childless container, so its placed rect equals its resolved box exactly
 *  (never run through `containRect`, which only an element is). */
const cell = (id: string, extra: Partial<HudNode> = {}): HudNode => ({
  kind: 'container', id, direction: 'row', children: [], ...extra,
} as HudNode);

const grid = (children: HudNode[], extra: Partial<HudGridContainer> = {}): HudGridContainer => ({
  kind: 'container', id: 'grid', layout: 'grid', columns: [{ px: 20 }, { px: 20 }], rows: ROWS, children, ...extra,
} as HudGridContainer);

/** The screen the nine anchors became (§42): the grid under test sits in the
 *  top-left cell, which is exactly what `anchor: 'top-left'` used to say. */
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
    // §42: an explicit cell is never refused for being taken - only auto-flow
    // walks past one. Paint order is `order`, then document order, so the
    // second child lands ON the first.
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
    // Auto-flow starts at column 1, row 1 - the partial column is ignored.
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
    // 5 cells at 2 columns = 3 rows; the 5th (e) is alone in the last one.
    expect(rectOf(doc, 'e')).toMatchObject({ x: 0, y: 40 });
  });
});

describe('fill tracks and gaps', () => {
  it('a fill column shares whatever the fixed columns leave, and gap.x separates them', () => {
    const doc = docOf(grid([cell('a'), cell('b')], {
      columns: [{ px: 20 }, 'fill'], gap: { x: 4 }, size: { w: { px: 100 } },
    }));
    // column 0 is 20, gap 4, column 1 (fill) takes the remaining 76.
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
    // `alignSelf` overrides BOTH axes for the child it is set on
    // (`place-grid.ts`'s own documented choice - one field, not two), so 'a'
    // needs its own height too: `end` is no longer `stretch`, and a childless
    // cell's natural height with no size of its own is 0.
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

/**
 * `gridCellRects` returns every CELL of a placed grid, including the ones no child
 * sits in.
 *
 * It exists because a lattice inferred from where the children landed cannot
 * answer the question an editor most needs to ask: a column with no child in it
 * still has a rectangle, and it has to be nameable. §44 factored `solveGrid` out
 * of `childBoxesGrid` so there is ONE track solve instead of two, and that is
 * the property under test. The cells here are the cells the children were
 * placed by, not a second derivation that happens to agree today.
 *
 * §46 removed its only caller (the stage's drop indicator) and kept the
 * function, because the cell-highlight overlay coming to the Layout section
 * needs exactly this. So it keeps its proof too.
 */
describe('every cell of a placed grid, empty ones included', () => {
  const cells = (root: HudGridContainer) => {
    const doc = docOf(root);
    const placed = placedById(layoutHud(doc, VIEW, {}), 'grid');
    return gridCellRects(placed?.node as HudGridContainer, placed!.rect, placed!.scale, {});
  };

  it('answers a rectangle for a cell no child is in', () => {
    // One child, top-left, in a 2x4 lattice of 20px tracks: the other seven
    // cells have no child to be inferred from and are all still targets.
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
    // A grid grows rows and never columns, so the row past the end is a legal
    // destination and a column past the end is not.
    // One declared 20px row inside a 60px-tall grid: 40px of the container is
    // past the last track, which is where the extra row is offered.
    const found = cells(grid(
      [cell('a', { size: { w: { px: 20 }, h: { px: 20 } } })],
      { rows: [{ px: 20 }], size: { h: { px: 60 } } },
    ));
    expect(new Set(found.map((c) => c.column))).toEqual(new Set([1, 2]));
    expect(found.filter((c) => c.implicit).map((c) => c.row)).toEqual([2, 2]);
  });
});
