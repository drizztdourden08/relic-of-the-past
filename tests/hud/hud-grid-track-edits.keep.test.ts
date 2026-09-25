/* @layer tests @kind test */
/**
 * §50's document rule: A TRACK EDIT JUST HAPPENS, AND THE CHILDREN FOLLOW.
 *
 * §48 refused to remove a column a child originated in and told the author to
 * move the child first. The maintainer's rule replaces that with an obligation
 * on the document instead of the person: "child are handled automatically
 * when changing the grid layout (moved to still be valid when changing something
 * in the grid mostly)."
 *
 * Every case below is one sentence of that rule, and the last two are the
 * INVARIANT, not a case: after any sequence of edits, every child's
 * `place` is in range and every span fits, and `validateLayout` accepts the
 * result. That is the half a table of examples cannot prove.
 */
import { describe, expect, it } from 'vitest';
import { editGridTracks, validateLayout } from '../../shared/hud/layouts';
import type { TrackEdit } from '../../shared/hud/layouts';
import type { HudGridContainer, HudLayout, HudNode, HudPlace } from '../../shared/types/hud';

const leaf = (id: string, place?: HudPlace): HudNode =>
  ({ id, kind: 'element', element: { type: 'spacer' }, ...(place ? { place } : {}) }) as unknown as HudNode;

const gridOf = (columns: number, rows: number, children: HudNode[]): HudGridContainer => ({
  kind: 'container',
  id: 'screen',
  layout: 'grid',
  columns: Array.from({ length: columns }, () => 'auto'),
  rows: Array.from({ length: rows }, () => 'auto'),
  children,
});

const placeOf = (container: HudGridContainer, id: string): HudPlace | undefined =>
  container.children.find((child) => child.id === id)?.place;

describe('removing a track takes its children somewhere real', () => {
  const grid = (): HudGridContainer => gridOf(4, 2, [
    leaf('before', { column: 1, row: 1 }),
    leaf('inside', { column: 2, row: 1 }),
    leaf('after', { column: 3, row: 1 }),
    leaf('band', { column: 2, row: 2, colSpan: 3 }),
  ]);

  it('shifts everything after it one index toward it', () => {
    const next = editGridTracks(grid(), { op: 'remove', axis: 'columns', index: 1 });
    expect(next.columns.length).toBe(3);
    expect(placeOf(next, 'after')).toEqual({ column: 2, row: 1 });
    // And what was BEFORE it does not move, which is the half a naive
    // "subtract one from everybody" gets wrong.
    expect(placeOf(next, 'before')).toEqual({ column: 1, row: 1 });
  });

  it('moves a child whose origin was IN it to the track before, when there is one', () => {
    const next = editGridTracks(grid(), { op: 'remove', axis: 'columns', index: 1 });
    expect(placeOf(next, 'inside')).toEqual({ column: 1, row: 1 });
  });

  it('falls forward to the track AFTER when the removed one was the first', () => {
    const next = editGridTracks(grid(), { op: 'remove', axis: 'columns', index: 0 });
    // `before` stood in column 1; column 1 is gone, so it lands on what is now
    // column 1, the track that used to be column 2.
    expect(placeOf(next, 'before')).toEqual({ column: 1, row: 1 });
    expect(placeOf(next, 'inside')).toEqual({ column: 1, row: 1 });
  });

  it('shrinks a span that covered it by exactly one', () => {
    const next = editGridTracks(grid(), { op: 'remove', axis: 'columns', index: 2 });
    expect(placeOf(next, 'band')).toEqual({ column: 2, row: 2, colSpan: 2 });
  });

  it('drops the span key entirely once it is back to one track', () => {
    let next = editGridTracks(grid(), { op: 'remove', axis: 'columns', index: 2 });
    next = editGridTracks(next, { op: 'remove', axis: 'columns', index: 2 });
    // Not `{ colSpan: 1 }` and not `{ colSpan: undefined }`: a key that is
    // present and undefined survives a JSON round trip as a key.
    expect(placeOf(next, 'band')).toEqual({ column: 2, row: 2 });
    expect('colSpan' in (placeOf(next, 'band') ?? {})).toBe(false);
  });

  it('refuses only the one structural floor, because a grid needs a column', () => {
    const one = gridOf(1, 1, [leaf('solo', { column: 1, row: 1 })]);
    expect(editGridTracks(one, { op: 'remove', axis: 'columns', index: 0 })).toBe(one);
    // Rows have no such floor: they empty back to implicit.
    const rowless = editGridTracks(one, { op: 'remove', axis: 'rows', index: 0 });
    expect(rowless.rows).toBeUndefined();
    expect(placeOf(rowless, 'solo')).toEqual({ column: 1, row: 1 });
  });
});

describe('inserting a track pushes what is at or after it away', () => {
  const grid = (): HudGridContainer => gridOf(3, 3, [
    leaf('first', { column: 1, row: 1 }),
    leaf('at', { column: 2, row: 1 }),
    leaf('straddle', { column: 1, row: 3, colSpan: 3 }),
  ]);

  it('shifts a child standing AT the insertion point by one', () => {
    const next = editGridTracks(grid(), { op: 'insert', axis: 'columns', index: 1 });
    expect(next.columns.length).toBe(4);
    expect(placeOf(next, 'at')).toEqual({ column: 3, row: 1 });
    expect(placeOf(next, 'first')).toEqual({ column: 1, row: 1 });
  });

  it('grows a span that STRADDLES the point instead of tearing it in half', () => {
    const next = editGridTracks(grid(), { op: 'insert', axis: 'columns', index: 1 });
    expect(placeOf(next, 'straddle')).toEqual({ column: 1, row: 3, colSpan: 4 });
  });

  it('leaves a span alone when the new track lands past its end', () => {
    const one = gridOf(4, 1, [leaf('band', { column: 1, row: 1, colSpan: 2 })]);
    const next = editGridTracks(one, { op: 'insert', axis: 'columns', index: 3 });
    expect(placeOf(next, 'band')).toEqual({ column: 1, row: 1, colSpan: 2 });
  });

  it('materialises implicit rows before editing them, so a visible row is real', () => {
    // A grid with no declared `rows` still SHOWS the rows its children reach,
    // and an insert above one of those has to mean what the eye saw.
    const implicit = {
      kind: 'container', id: 'g', layout: 'grid', columns: ['auto'],
      children: [leaf('low', { column: 1, row: 3 })],
    } as unknown as HudGridContainer;
    const next = editGridTracks(implicit, { op: 'insert', axis: 'rows', index: 1 });
    expect(next.rows?.length).toBe(4);
    expect(placeOf(next, 'low')).toEqual({ column: 1, row: 4 });
  });
});

describe('moving a track carries its children with it', () => {
  const grid = (): HudGridContainer => gridOf(3, 1, [
    leaf('a', { column: 1, row: 1 }),
    leaf('b', { column: 2, row: 1 }),
    leaf('c', { column: 3, row: 1 }),
  ]);

  it('takes the moved track\'s own children to its new index', () => {
    const next = editGridTracks(grid(), { op: 'move', axis: 'columns', from: 2, to: 0 });
    expect(placeOf(next, 'c')).toEqual({ column: 1, row: 1 });
  });

  it('shifts the displaced neighbours the other way', () => {
    const next = editGridTracks(grid(), { op: 'move', axis: 'columns', from: 2, to: 0 });
    expect(placeOf(next, 'a')).toEqual({ column: 2, row: 1 });
    expect(placeOf(next, 'b')).toEqual({ column: 3, row: 1 });
  });

  it('leaves everyone outside the moved range where they were', () => {
    const next = editGridTracks(grid(), { op: 'move', axis: 'columns', from: 0, to: 1 });
    expect(placeOf(next, 'a')).toEqual({ column: 2, row: 1 });
    expect(placeOf(next, 'b')).toEqual({ column: 1, row: 1 });
    expect(placeOf(next, 'c')).toEqual({ column: 3, row: 1 });
  });
});

describe('append and size never move a child at all', () => {
  it('hands the same children back, identically', () => {
    const grid = gridOf(2, 2, [leaf('x', { column: 2, row: 2, colSpan: 1 })]);
    const appended = editGridTracks(grid, { op: 'append', axis: 'columns' });
    expect(appended.columns.length).toBe(3);
    expect(appended.children).toBe(grid.children);
    const sized = editGridTracks(grid, { op: 'size', axis: 'columns', indices: [0], extent: 'fill' });
    expect(sized.columns).toEqual(['fill', 'auto']);
    expect(sized.children).toBe(grid.children);
  });
});

describe('the invariant, over a sequence instead of a case', () => {
  const EDITS: TrackEdit[] = [
    { op: 'remove', axis: 'columns', index: 1 },
    { op: 'insert', axis: 'rows', index: 0 },
    { op: 'move', axis: 'columns', from: 0, to: 1 },
    { op: 'remove', axis: 'rows', index: 2 },
    { op: 'append', axis: 'columns' },
    { op: 'insert', axis: 'columns', index: 2 },
    { op: 'remove', axis: 'columns', index: 0 },
    { op: 'move', axis: 'rows', from: 1, to: 0 },
    { op: 'remove', axis: 'rows', index: 0 },
    { op: 'remove', axis: 'columns', index: 1 },
  ];

  const START = (): HudGridContainer => gridOf(4, 4, [
    leaf('corner', { column: 1, row: 1 }),
    leaf('wide', { column: 2, row: 2, colSpan: 3 }),
    leaf('tall', { column: 4, row: 1, rowSpan: 4 }),
    leaf('block', { column: 2, row: 3, colSpan: 2, rowSpan: 2 }),
    leaf('flowed'),
  ]);

  it('keeps every place in range and every span inside the grid, at every step', () => {
    let grid = START();
    for (const edit of EDITS) {
      grid = editGridTracks(grid, edit);
      const columns = grid.columns.length;
      const rows = grid.rows?.length ?? Infinity;
      expect(columns).toBeGreaterThanOrEqual(1);
      for (const child of grid.children) {
        const place = child.place;
        if (!place) continue;
        const c0 = place.column ?? 1;
        const r0 = place.row ?? 1;
        expect(`${child.id} c ${c0 >= 1 && c0 + (place.colSpan ?? 1) - 1 <= columns}`)
          .toBe(`${child.id} c true`);
        expect(`${child.id} r ${r0 >= 1 && r0 + (place.rowSpan ?? 1) - 1 <= rows}`)
          .toBe(`${child.id} r true`);
      }
    }
  });

  it('hands `validateLayout` something it accepts, after all ten', () => {
    let grid = START();
    for (const edit of EDITS) grid = editGridTracks(grid, edit);
    const doc = { id: 'g', name: 'g', builtIn: false, screen: grid } as unknown as HudLayout;
    const parsed = validateLayout(JSON.parse(JSON.stringify(doc)) as unknown);
    expect(parsed.errors).toEqual([]);
  });
});
