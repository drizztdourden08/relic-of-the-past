/* @layer shared-game @kind logic */
/**
 * The text box as the renderer drives it: three row buffers and one pen,
 * advanced token by token. `measureRows` and `splitScreens` both run this walk
 * so their verdicts cannot disagree.
 *
 * Engine behaviour modelled:
 * - Writing advances the pen by each glyph's width and NEVER checks the row
 *   bound: a run wider than the interior is recorded as overflow, not wrapped.
 * - A row marker parks the pen at the LEFT EDGE of that row without clearing it.
 * - A scroll shifts the box up one line and parks the pen on the last row.
 * - A wait-for-button holds the box without clearing anything, so the next
 *   screen inherits whichever rows are still standing.
 *
 * TWO CONVENTIONS FOR A ROW JUMP:
 * - `blankOnJump: true` (the DEFAULT) treats the landing row as empty. A
 *   MEASUREMENT convention: a fresh run is sized without an earlier run's
 *   leftovers, and every published width depends on it.
 * - `blankOnJump: false` is the ENGINE's real behaviour: the pixel buffer is
 *   cleared once per message, so a row marker blanks nothing and a shorter
 *   rewrite only overpaints the left part. Anything showing what is on screen
 *   (`blocks/inherited-rows.ts`) must use this mode; anything reporting a width must not.
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

/** A run left standing on a row, with each glyph's left edge in pixels. */
type Run = {
  glyphs: number[];
  /** Left edge of the glyph at the same position, in pixels from the row start. */
  offsets: number[];
  widthPx: number;
};

/** One row buffer: the run the pen is drawing, over whatever was there before. */
type BoxRow = Run & {
  /** Something was written here, even if it turned out to be unmeasurable. */
  drawn: boolean;
  /** What was standing when the pen last returned to this row's left edge;
   *  kept only in the faithful mode (`blankOnJump: true` wipes the row). */
  stale: Run | null;
};

/** The whole walk state: the visible box, plus every run it has closed. */
type Pen = {
  /** 1-based row the pen is on. */
  row: number;
  slots: BoxRow[];
  /** Every closed run, oldest first. Runs later overwritten are kept too. */
  runs: RowFit[];
  /** Text no glyph could be found for, in encounter order. */
  unmatched: string[];
  /** Count of visible changes, so a caller can tell "nothing happened" apart. */
  edits: number;
  blankOnJump: boolean;
};

/** How a walk treats a row jump (see the two conventions in the header). */
type PenOptions = {
  /** Whether landing on a row wipes it. Default true (measurement); false is the engine's behaviour. */
  blankOnJump?: boolean;
};

/** What a token did that a caller may need to react to. */
type TokenEffect = 'none' | 'wait';

const emptyRun = (): Run => ({ glyphs: [], offsets: [], widthPx: 0 });

const blankRow = (): BoxRow => ({ ...emptyRun(), drawn: false, stale: null });

const createPen = (opts?: PenOptions): Pen => ({
  row: 1,
  slots: Array.from({ length: ROWS_PER_BOX }, blankRow),
  runs: [],
  unmatched: [],
  edits: 0,
  blankOnJump: opts?.blankOnJump ?? true,
});

const asRowFit = (row: number, run: Run): RowFit => ({
  row,
  glyphs: [...run.glyphs],
  widthPx: run.widthPx,
  overflow: run.widthPx > ROW_WIDTH_PX,
});

/**
 * The row as the player sees it: the pen's own run, then the part of an earlier
 * run it did not paint over. A glyph straddling the new run's right edge is half
 * repainted, so it drops out of `glyphs` while its pixels still count toward
 * `widthPx`; a row's glyph widths need not add up to its width.
 */
const visibleRun = (buf: BoxRow): Run => {
  const { stale } = buf;
  if (stale === null) return buf;

  const from = stale.offsets.findIndex(at => at >= buf.widthPx);
  const kept = from < 0 ? stale.offsets.length : from;

  return {
    glyphs: [...buf.glyphs, ...stale.glyphs.slice(kept)],
    offsets: [...buf.offsets, ...stale.offsets.slice(kept)],
    widthPx: Math.max(buf.widthPx, stale.widthPx),
  };
};

/** Record the run the pen just finished. The row itself stays on screen. */
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
    buf.offsets.push(buf.widthPx);
    buf.widthPx += widthOf(index, metrics);
  }
};

const writeText = (pen: Pen, text: string, metrics: GlyphMetrics): void => {
  if (text.length === 0) return;
  const { glyphs, unmatched } = matchGlyphs(text, metrics);
  pen.unmatched.push(...unmatched);
  drawGlyphs(pen, glyphs, metrics);
};

/** Back to a row's left edge with everything on it left standing. */
const reopenRow = (buf: BoxRow): BoxRow => {
  if (!buf.drawn && buf.stale === null) return buf;
  return { ...emptyRun(), drawn: false, stale: visibleRun(buf) };
};

const jumpTo = (pen: Pen, row: number): void => {
  closeRun(pen);
  const buf = pen.slots[row - 1];
  pen.slots[row - 1] = pen.blankOnJump ? blankRow() : reopenRow(buf);
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
  (buf, at) => (buf.drawn || buf.stale !== null ? [asRowFit(at + 1, visibleRun(buf))] : []),
);

/**
 * A paramless bracketed name is a glyph when the alphabet spells it (several
 * alphabets carry bracketed pseudo-glyphs, and the token parser cannot tell
 * those from a control code without a language). Anything else is a real
 * control code and advances the pen by nothing. `codes/glyph.ts` answers the
 * same question given a LanguageConfig; measurement holds only the metrics and
 * needs the index, so it goes through the matcher.
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
export type { Pen, PenOptions, TokenEffect };
