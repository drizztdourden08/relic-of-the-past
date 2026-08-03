/* @layer renderer-components @kind hook */
/**
 * Steps one column aside for the column being carried over it — the WHOLE
 * column, its header and every body cell together, so what moves reads as a
 * column and not as a header label twitching on its own.
 *
 * How far it steps is measured, never a token distance: "step aside" has to
 * mean "as far as you will actually end up", and only the DOM knows how wide
 * the carried column is right now. A fixed nudge is the failure this replaces —
 * a few pixels under a drag image is indistinguishable from nothing happening.
 *
 * The transform is written straight onto the cells, for the same reason the
 * resize preview writes its track list straight onto the root: a table renders
 * every row it holds, and putting the hovered slot into row state would
 * re-render all of them on every mouse move. The stylesheet supplies only the
 * transition, so the move still animates.
 */
import { useEffect } from 'react';
import { CELL_ATTR, HEAD_ATTR, renderedHeaderWidth } from './measure-column';
import type { RefObject } from 'react';
import type { DragShift } from './column-drag-shift';

/** The scroller the header and every row live inside — the one place to look. */
const ROOT_SELECTOR = '.data-table__scroll';

interface UseColumnShiftInput {
  /** This column's header cell, which is also how its scroller is found. */
  cellRef: RefObject<HTMLElement | null>;
  /** This column's path — its body cells are tagged with it too. */
  path: string;
  /** Which way this column steps aside, if at all. */
  shift: DragShift;
  /** The column in the air, whose width is the distance everything else steps. */
  carriedPath: string | null;
}

/** One column, top to bottom: its header cell and every cell under it. */
const columnCells = (root: ParentNode, path: string): HTMLElement[] =>
  [...root.querySelectorAll(`[${HEAD_ATTR}="${path}"], [${CELL_ATTR}="${path}"]`)]
    .filter((node): node is HTMLElement => node instanceof HTMLElement);

/**
 * The hole the carried column leaves: its own track plus the gutter beside it,
 * because both close up when it goes. Read off the grid rather than assumed —
 * a resized column is as wide as the drag made it.
 */
const holeWidth = (root: HTMLElement, carriedPath: string): number => {
  const width = renderedHeaderWidth(root, carriedPath);
  if (width === 0) return 0;
  const row = root.querySelector(`[${HEAD_ATTR}="${carriedPath}"]`)?.parentElement;
  const gap = row ? Number.parseFloat(getComputedStyle(row).columnGap) : Number.NaN;
  return width + (Number.isNaN(gap) ? 0 : gap);
};

const useColumnShift = (input: UseColumnShiftInput): void => {
  const { cellRef, path, shift, carriedPath } = input;

  useEffect(() => {
    const root = cellRef.current?.closest(ROOT_SELECTOR);
    if (!(root instanceof HTMLElement) || shift === 'none' || carriedPath === null) return undefined;
    const distance = holeWidth(root, carriedPath);
    if (distance === 0) return undefined;

    const offset = shift === 'left' ? -distance : distance;
    const cells = columnCells(root, path);
    cells.forEach((cell) => { cell.style.transform = `translateX(${offset}px)`; });
    /* Clearing it is what animates the column back, so it belongs to the effect. */
    return () => cells.forEach((cell) => { cell.style.transform = ''; });
  }, [cellRef, path, shift, carriedPath]);
};

export { useColumnShift };
export type { UseColumnShiftInput };
