/* @layer shared-game @kind logic */
/**
 * Row-level fit measurement: how wide every run of text in a token stream comes
 * out, and which of those runs the engine would draw past the row's edge.
 *
 * One `RowFit` is emitted per PEN RUN, not per physical row, so a row written
 * twice reports twice. That matters for an overflow check: an entry that
 * overruns row 1 and then returns to row 1 with something short would look
 * clean if only the final state were reported, and the overrun would ship.
 * Runs come out in the order the pen closed them.
 *
 * Unmatched text is never charged a width — no glyph, no advance — so it cannot
 * quietly count as zero either: `measureRowsDetailed` returns it alongside the
 * rows, and any entry with a non-empty `unmatched` list should be read as
 * unmeasurable rather than safe. `measureRows` is the thin form for callers that
 * have already validated their text (see `validateEntry`).
 */
import { resolveRefs } from '../glossary/resolve-refs';
import type { GlossaryTerm, Token } from '../types';
import { applyToken, closeRun, createPen } from './box-pen';
import type { LayoutOptions } from './layout-plan';
import { layoutPlan } from './layout-plan';
import type { GlyphMetrics, RowFit } from './types';

/** Rows as measured, plus whatever the alphabet could not account for. */
type RowMeasurement = {
  rows: RowFit[];
  /** Text with no glyph in this language, in encounter order. */
  unmatched: string[];
};

const measureRowsDetailed = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  opts?: LayoutOptions,
): RowMeasurement => {
  const plan = layoutPlan(metrics, opts);
  const pen = createPen();

  for (const token of resolveRefs(tokens, glossary)) applyToken(pen, token, plan);
  closeRun(pen);

  return { rows: pen.runs, unmatched: pen.unmatched };
};

const measureRows = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  opts?: LayoutOptions,
): RowFit[] => measureRowsDetailed(tokens, metrics, glossary, opts).rows;

export { measureRows, measureRowsDetailed };
export type { RowMeasurement };
