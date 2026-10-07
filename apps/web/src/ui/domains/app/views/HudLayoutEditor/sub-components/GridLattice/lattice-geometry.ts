/* @layer renderer-components @kind logic */
/**
 * The lattice's arithmetic: addresses, rectangles, occupancy and, since §50,
 * its PROPORTIONS.
 *
 * THE CELLS MATCH THE REAL TRACKS NOW. §48 drew a uniform square per address on
 * the argument that proportionality and clickability were opposed; the
 * maintainer's answer was "this doesn't look like a grid if they do not", and
 * the two are reconcilable: the track sizes come from the engine's own
 * `solveGrid` and enter the drawing as `fr` weights with a `minmax(24px, ...)`
 * floor, so a track keeps its share of the space until that share would fall
 * below the target size, and never below it. No track is ever squashed and no
 * measurement is needed. The whole thing is one `grid-template` string, which
 * is also what lets it be server-rendered and measured in a headless browser.
 *
 * AN EMPTY `auto` TRACK SOLVES TO 0 AND IS DRAWN AT THE FLOOR, MARKED. Drawing
 * it at 24px without saying so would be a lie about its size; `emptyOn` is what
 * the header wears to tell the truth about the floor.
 *
 * OCCUPANCY IS THE ENGINE'S OWN ANSWER (`assignCells`). It is pure, needs no
 * `MeasureContext`, and resolves auto-flowed children too, so the panel cannot
 * disagree with the stage about which cell a child stands in. It is READ-ONLY
 * here: §50 removed every child edit from the grid editor.
 */
import { assignCells } from '@shared/hud/engine/grid-cells';
import type { HudGridContainer } from '@shared/types/hud';

/** 1-based, like `place.column`/`place.row` and like a spreadsheet. */
interface CellRef { column: number; row: number }

interface CellBounds { c0: number; c1: number; r0: number; r1: number }

/** A child's resolved footprint, from `assignCells`. */
interface Occupant { id: string; column: number; row: number; colSpan: number; rowSpan: number }

/** WCAG 2.2 SC 2.5.8's target size, on BOTH axes. It is the one number a
 *  proportion is never allowed to argue with. */
const CELL_MIN = 24;
/**
 * The row-header strip's width and the column-header strip's height.
 *
 * THE GUTTER IS 42, NOT 24, SINCE §55, AND THE 18px IS BOUGHT BACK TWICE OVER.
 * A selected row header stops printing its number and becomes its own size
 * control (`TrackHead`), and `auto ▾` needs about 34px of mono. That is what
 * deletes the 81px `[size ▾]` field from the contextual toolbar and lets that
 * strip fit ONE row at the 232px rail again. Nothing is unnameable while the
 * swap lasts: the toolbar's leading chip says `ROW 2` for exactly as long.
 */
const GUTTER = 42;
const HEAD = 20;
/** The trailing strip at the end of each axis, where its `+` button lives. */
const ADD = 22;

const cellKey = (cell: CellRef): string => `${cell.column},${cell.row}`;

const rectCells = (a: CellRef, b: CellRef): CellRef[] => {
  const out: CellRef[] = [];
  for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row += 1) {
    for (let column = Math.min(a.column, b.column); column <= Math.max(a.column, b.column); column += 1) {
      out.push({ column, row });
    }
  }
  return out;
};

const boundsOf = (cells: readonly CellRef[]): CellBounds => ({
  c0: Math.min(...cells.map((c) => c.column)),
  c1: Math.max(...cells.map((c) => c.column)),
  r0: Math.min(...cells.map((c) => c.row)),
  r1: Math.max(...cells.map((c) => c.row)),
});

const occupantsOf = (container: HudGridContainer): Occupant[] =>
  [...assignCells(container.children, Math.max(1, container.columns.length))]
    .map(([node, cell]) => ({ id: node.id, ...cell }));

const covers = (occupant: Occupant, column: number, row: number): boolean =>
  column >= occupant.column && column < occupant.column + occupant.colSpan
  && row >= occupant.row && row < occupant.row + occupant.rowSpan;

const occupantsAt = (occupants: readonly Occupant[], column: number, row: number): Occupant[] =>
  occupants.filter((occupant) => covers(occupant, column, row));

/** Whose ORIGIN sits inside the rectangle. That is what "this track holds" means. */
const originsIn = (occupants: readonly Occupant[], bounds: CellBounds): Occupant[] =>
  occupants.filter((o) => o.column >= bounds.c0 && o.column <= bounds.c1
    && o.row >= bounds.r0 && o.row <= bounds.r1);

/** As many rows as the children actually reach, never fewer than declared. */
const rowCountFor = (container: HudGridContainer, occupants: readonly Occupant[]): number =>
  Math.max(container.rows?.length ?? 0, 1, ...occupants.map((o) => o.row + o.rowSpan - 1));

/** A track that solved to nothing. It is drawn at the floor, and SAID so. */
const emptyOn = (sizes: readonly number[], index: number): boolean =>
  sizes.length > index && (sizes[index] ?? 0) <= 0;

/**
 * One axis as `fr` weights with the target-size floor under each. `fr` is what
 * makes it uniform: every track gets its share of one scale, and the floor takes
 * space from the others instead of shrinking anybody past 24px. When the
 * floors no longer fit, the lattice OVERFLOWS and scrolls (the header strips are
 * sticky and stay put) instead of squashing a track.
 */
const trackTemplate = (sizes: readonly number[], count: number, lead: number): string => {
  const shares = Array.from({ length: count }, (_unused, i) => Math.max(0, sizes[i] ?? 0));
  const flat = shares.every((share) => share <= 0);
  const cells = shares.map((share) => `minmax(${CELL_MIN}px, ${flat ? 1 : share}fr)`);
  return `${lead}px ${cells.join(' ')}`;
};

/** The lattice's own padding and the gap between cells, in px. Needed here
 *  because the height below is arithmetic, not a layout the browser can
 *  be left to do. */
const PAD = 2;
const GAP = 2;
/** A comfortable band before the viewport cap bites, and the cap. */
const ROW_IDEAL = 44;
const VIEWPORT = 220;

/**
 * THE BODY NEEDS A DEFINITE HEIGHT, or the row `fr`s have nothing to divide and
 * every row collapses onto its 24px floor into a strip of equal bands, which is
 * the exact picture §50 exists to stop drawing. It is arithmetic instead of
 * `aspect-ratio` off the grid's own shape, and that is a judgement worth stating:
 * the screen's root is 398 x 224, so its true aspect in a 188px rail leaves 96px
 * of height for three rows that need 72 of floor plus 30 of chrome. Every row
 * floors, and the drawing goes back to being uniform at exactly the rail where
 * it matters most. So the axes are scaled independently: each one keeps ITS
 * tracks' proportions (which is what "cells match the row and column" asks), and
 * the height is chosen to be big enough to show them and small enough not to
 * push the legend below the fold. Past the cap it scrolls.
 */
const latticeHeight = (rows: number): number =>
  Math.min(VIEWPORT, HEAD + PAD * 2 + GAP * rows + rows * ROW_IDEAL);

export {
  ADD, CELL_MIN, GUTTER, HEAD, ROW_IDEAL, VIEWPORT, boundsOf, cellKey, covers, emptyOn,
  latticeHeight, occupantsAt, occupantsOf, originsIn, rectCells, rowCountFor, trackTemplate,
};
export type { CellBounds, CellRef, Occupant };
