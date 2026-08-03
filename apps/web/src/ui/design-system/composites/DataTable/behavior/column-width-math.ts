/* @layer renderer-components @kind logic */
/**
 * The arithmetic behind both ways a column gets a pixel width: a pointer drag
 * on the seam between two headers, and "fit to content" over the widths that
 * were actually measured off the screen.
 *
 * Both are pure so they can be asserted without a browser — the gesture that
 * feeds the first and the DOM that feeds the second cannot be, and each is a
 * thin wrapper next door.
 */

/** Narrow enough to shrink a column to nothing useful is not a column. */
const MIN_COLUMN_WIDTH = 64;

/** One column may not own the whole row, however long a value it holds. */
const MAX_COLUMN_WIDTH = 720;

/** Breathing room either side of the widest measured value. */
const FIT_PADDING = 16;

interface DragWidthInput {
  /** The column's rendered width at the instant the seam was grabbed. */
  startWidth: number;
  /** Pointer x at that same instant. */
  startX: number;
  /** Pointer x now. */
  clientX: number;
}

const clampWidth = (width: number): number =>
  Math.round(Math.min(Math.max(width, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH));

/** Dragging the seam is a delta on the width the column already had. */
const widthFromDrag = ({ startWidth, startX, clientX }: DragWidthInput): number =>
  clampWidth(startWidth + (clientX - startX));

/**
 * The width that fits every content width handed in. An empty list keeps the
 * minimum rather than collapsing: nothing measurable is not the same as nothing
 * there, and a column that vanished on a menu click reads as a bug.
 */
const fitColumnWidth = (contentWidths: readonly number[]): number =>
  clampWidth(Math.max(0, ...contentWidths) + FIT_PADDING);

/** A column and the width a fit sized it to. */
interface ColumnWidth {
  path: string;
  width: number;
}

/**
 * Fitting the whole table is fitting one column, repeated — the widths come out
 * of the SAME rule a single column's fit uses, so the footer's "fit all" and a
 * column's own can never disagree about the same column.
 *
 * The measuring is handed in because it is the one part that needs a screen;
 * the loop and the rule do not, and stay assertable here.
 */
const fitAllWidths = (
  paths: readonly string[],
  contentWidthsOf: (path: string) => readonly number[],
): ColumnWidth[] =>
  paths.map((path) => ({ path, width: fitColumnWidth(contentWidthsOf(path)) }));

export {
  FIT_PADDING, MAX_COLUMN_WIDTH, MIN_COLUMN_WIDTH,
  clampWidth, fitAllWidths, fitColumnWidth, widthFromDrag,
};
export type { ColumnWidth, DragWidthInput };
