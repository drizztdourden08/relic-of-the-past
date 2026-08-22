/* @layer renderer-components @kind logic */
/**
 * What one gutter row says, as strings.
 *
 * Pure on purpose: the numbers a translator steers by are worth being able to
 * check without a browser, and formatting them here keeps the row component down
 * to layout.
 *
 * Three facts per line, in the order they matter. The ROW is which of the box's
 * three rows the engine will write this line on — the thing that used to be an
 * inline marker and is now simply where the line sits. The PIXELS are what is
 * left of that row's width, which is the only number that decides whether the
 * line is safe. The COUNT is characters, with a substitution or a picture
 * counting once however much it draws, because that is what an author typed.
 *
 * A negative pixel figure is not a smaller number, it is a defect: the engine
 * keeps writing past the edge of the box and paints over the row below, and the
 * only way to see it otherwise is to play the scene. It is spelled with a sign
 * and an explicit word so it cannot be misread as tight-but-fine.
 */
import { ROW_WIDTH_PX } from '@shared/game/language';
import type { DialogueLineView } from '@shared/game/language';

/** Stands in for a width that cannot be known — the set's font is not loaded. */
const kUnknown = '–';

/** One gutter row's text. */
type GutterCells = {
  row: string;
  /** Pixels still free on the row, or the unknown mark. */
  free: string;
  count: string;
  /** The whole row spelled out, for the cell's tooltip and screen readers. */
  title: string;
};

const freeTitle = (freePx: number): string => (
  freePx < 0
    ? `${-freePx}px too long — the game paints over the row below`
    : `${freePx}px free of ${ROW_WIDTH_PX}`
);

const formatGutterCells = (line: DialogueLineView, pixelsKnown: boolean): GutterCells => {
  const { row, freePx, count } = line;
  const characters = `${count} character${count === 1 ? '' : 's'}`;
  const width = pixelsKnown ? freeTitle(freePx) : 'width unknown until the set\'s font loads';

  return {
    row: String(row),
    free: pixelsKnown ? String(freePx) : kUnknown,
    count: String(count),
    title: `Row ${row} · ${width} · ${characters}`,
  };
};

/** One gutter row, ready to draw. */
type GutterRowModel = {
  key: number;
  cells: GutterCells;
  overflow: boolean;
  /** First line of its box — where the group's left border begins. */
  boxStart: boolean;
  /** Last line of its box: a wait follows, so the player presses here. */
  boxEnd: boolean;
};

/**
 * The gutter as rows. Box membership is read off the lines themselves rather
 * than counted a second time: a box starts at the first line and again after
 * every line that ends one.
 */
const buildGutterRows = (
  lines: DialogueLineView[],
  pixelsKnown: boolean,
): GutterRowModel[] => lines.map((line, index) => ({
  key: line.index,
  cells: formatGutterCells(line, pixelsKnown),
  overflow: pixelsKnown && line.overflow,
  boxStart: index === 0 || lines[index - 1].endsBox,
  boxEnd: line.endsBox,
}));

/** True when any line runs past the edge of the box — what blocks a save. */
const hasOverflow = (lines: DialogueLineView[]): boolean => lines.some((line) => line.overflow);

export { buildGutterRows, formatGutterCells, hasOverflow };
export type { GutterCells, GutterRowModel };
