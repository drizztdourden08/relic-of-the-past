/* @layer shared-game @kind types */
/**
 * The line-oriented view of one dialogue entry. The editor's model, not a
 * second layout engine.
 *
 * The engine writes into a three-row box and never wraps, so authored text is
 * naturally a stack of LINES: each one begins with the code that put the pen
 * there (a row marker, or a scroll) and ends either where the next such code
 * appears or at a wait-for-button, which is what a reader experiences as the end
 * of a box. Modelling that directly gives an editor per-line numbering and a
 * per-line width budget, the way a code editor gutters its lines, instead of one
 * long run with control codes buried inside it.
 *
 * These views are DERIVED and read-only: every measurement comes from the shared
 * layout walk (`layout/box-pen.ts`), and `advance` holds the code exactly as it
 * was authored so the inverse can put it back untouched.
 */
import type { Token } from '../types';

/** What put the pen on a line's row. */
type LineAdvance =
  /** An explicit row-start code, kept as authored even when it looks irregular. */
  | { kind: 'row'; row: 1 | 2 | 3 }
  /** A scroll: the box shifts up a line and the pen parks on the bottom row. */
  | { kind: 'scroll' }
  /** No code at all, as on the first line of an entry or the one after a wait. */
  | null;

/** One authored line of an entry, with everything a gutter needs to show. */
type DialogueLineView = {
  /** 0-based index across the whole entry. */
  index: number;
  /** 0-based box this line belongs to; a wait starts a new box. */
  box: number;
  /** 1-based row within its box, as the engine would place it. */
  row: number;
  /** The code that STARTED this line, preserved exactly as authored. */
  advance: LineAdvance;
  /** Content tokens only. No advance code, no trailing wait. */
  tokens: Token[];
  /** True when this line is followed by a wait-for-button. */
  endsBox: boolean;
  widthPx: number;
  /** Characters, counting a substitution or picture glyph as one. */
  count: number;
  overflow: boolean;
  /** Pixels still free on this row; negative when it overruns. */
  freePx: number;
};

export type { DialogueLineView, LineAdvance };
