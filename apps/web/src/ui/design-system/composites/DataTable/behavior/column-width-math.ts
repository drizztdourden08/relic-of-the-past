/* @layer renderer-components @kind logic */
/** The arithmetic behind a seam drag and "fit to content". Pure, so it is testable without a browser. */

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

/** The width that fits every content width handed in. An empty list keeps the minimum instead of collapsing. */
const fitColumnWidth = (contentWidths: readonly number[]): number =>
  clampWidth(Math.max(0, ...contentWidths) + FIT_PADDING);

/** A column and the width a fit sized it to. */
interface ColumnWidth {
  path: string;
  width: number;
}

/** Fit-all is a single column's fit, repeated, so the two never disagree. Measuring is handed in because it needs a screen. */
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
