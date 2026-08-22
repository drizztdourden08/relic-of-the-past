/* @layer shared-game @kind logic */
/**
 * The text box as the renderer actually drives it: three row buffers and one
 * pen, advanced token by token. Both public entry points (`measureRows`,
 * `splitScreens`) run this same walk so their verdicts can never disagree.
 *
 * The engine's behaviour being modelled here:
 *
 * - Writing advances the pen by each glyph's own width and NEVER checks the row
 *   bound, so a run wider than the interior is recorded as overflow rather than
 *   wrapped.
 * - A row marker parks the pen at the LEFT EDGE of that row without clearing
 *   it. Measurement therefore closes the run the pen was on and starts a fresh
 *   one: whatever the earlier run left further right is stale tiles, not part
 *   of the new run's width.
 * - A scroll shifts the box up one line (first row falls off, a blank row
 *   arrives at the bottom) and parks the pen on the last row.
 * - A wait-for-button holds the box without clearing anything, which is why the
 *   next screen inherits whichever rows are still standing.
 */
import type { Token } from '../types';
import type { GlyphMetrics, RowFit } from './types';
import { ROW_WIDTH_PX, ROWS_PER_BOX } from './types';
import { glyphIndexOf, matchGlyphs, widthOf } from './glyph-metrics';
import type { LayoutPlan } from './layout-plan';

/** Shifts the box up a line and parks the pen on the last row. */
const kScrollCommand = 'Scroll';

/** Holds the box until the player presses a button; clears nothing. */
const kWaitCommand = 'Waitkey';

/** One row buffer: the run currently drawn on it. */
type BoxRow = {
  glyphs: number[];
  widthPx: number;
  /** Something was written here, even if it turned out to be unmeasurable. */
  drawn: boolean;
};

/** The whole walk state: the visible box, plus every run it has closed. */
type Pen = {
  /** 1-based row the pen is on. */
  row: number;
  slots: BoxRow[];
  /** Every closed run, oldest first — including runs later overwritten. */
  runs: RowFit[];
  /** Text no glyph could be found for, in encounter order. */
  unmatched: string[];
  /** Count of visible changes, so a caller can tell "nothing happened" apart. */
  edits: number;
};

/** What a token did that a caller may need to react to. */
type TokenEffect = 'none' | 'wait';

const blankRow = (): BoxRow => ({ glyphs: [], widthPx: 0, drawn: false });

const createPen = (): Pen => ({
  row: 1,
  slots: Array.from({ length: ROWS_PER_BOX }, blankRow),
  runs: [],
  unmatched: [],
  edits: 0,
});

const asRowFit = (row: number, buf: BoxRow): RowFit => ({
  row,
  glyphs: [...buf.glyphs],
  widthPx: buf.widthPx,
  overflow: buf.widthPx > ROW_WIDTH_PX,
});

/**
 * Record the run the pen just finished. The row itself stays on screen — this
 * only ends the pen's involvement with it.
 */
const closeRun = (pen: Pen): void => {
  const buf = pen.slots[pen.row - 1];
  if (buf.drawn) pen.runs.push(asRowFit(pen.row, buf));
};

const drawGlyphs = (pen: Pen, glyphs: number[], metrics: GlyphMetrics): void => {
  const buf = pen.slots[pen.row - 1];
  buf.drawn = true;
  pen.edits += 1;

  for (const index of glyphs) {
    buf.glyphs.push(index);
    buf.widthPx += widthOf(index, metrics);
  }
};

const writeText = (pen: Pen, text: string, metrics: GlyphMetrics): void => {
  if (text.length === 0) return;
  const { glyphs, unmatched } = matchGlyphs(text, metrics);
  pen.unmatched.push(...unmatched);
  drawGlyphs(pen, glyphs, metrics);
};

const jumpTo = (pen: Pen, row: number): void => {
  closeRun(pen);
  pen.slots[row - 1] = blankRow();
  pen.row = row;
  pen.edits += 1;
};

const scroll = (pen: Pen): void => {
  closeRun(pen);
  pen.slots = [...pen.slots.slice(1), blankRow()];
  pen.row = ROWS_PER_BOX;
  pen.edits += 1;
};

/** The box as the player sees it right now, top row first. */
const visibleRows = (pen: Pen): RowFit[] => pen.slots.flatMap(
  (buf, at) => (buf.drawn ? [asRowFit(at + 1, buf)] : []),
);

/**
 * A paramless bracketed name is a glyph when the alphabet spells it — several
 * alphabets carry bracketed pseudo-glyphs, and the token parser cannot tell
 * those from a control code without a language to consult. Anything else is a
 * real control code and advances the pen by nothing.
 *
 * `codes/glyph.ts` answers the same question for a caller holding a
 * LanguageConfig; measurement holds only the metrics, and needs the index
 * rather than a yes or no, so it goes through the matcher instead.
 */
const glyphForName = (name: string, metrics: GlyphMetrics): number | null => {
  const match = glyphIndexOf(`[${name}]`, 0, metrics);
  return match !== null && match.length === name.length + 2 ? match.index : null;
};

const applyCmd = (pen: Pen, name: string, param: number | undefined, plan: LayoutPlan): TokenEffect => {
  if (param !== undefined) return 'none';

  const glyph = glyphForName(name, plan.metrics);
  if (glyph !== null) {
    drawGlyphs(pen, [glyph], plan.metrics);
    return 'none';
  }

  if (name === kScrollCommand) scroll(pen);
  return name === kWaitCommand ? 'wait' : 'none';
};

/** Advance the walk by one token. Refs must already be resolved. */
const applyToken = (pen: Pen, token: Token, plan: LayoutPlan): TokenEffect => {
  if (token.t === 'text') {
    writeText(pen, token.v, plan.metrics);
    return 'none';
  }
  if (token.t === 'break') {
    jumpTo(pen, token.row);
    return 'none';
  }
  if (token.t === 'var') {
    if (token.name === 'number') drawGlyphs(pen, [plan.numberGlyph], plan.metrics);
    else {
      pen.unmatched.push(...plan.nameUnmatched);
      drawGlyphs(pen, plan.nameGlyphs, plan.metrics);
    }
    return 'none';
  }
  if (token.t === 'cmd') return applyCmd(pen, token.name, token.param, plan);

  throw new Error(
    `measure: unresolved glossary reference "${token.key}". `
    + 'Run resolveRefs on the token stream before measuring it.',
  );
};

export { applyToken, closeRun, createPen, visibleRows };
export type { Pen, TokenEffect };
