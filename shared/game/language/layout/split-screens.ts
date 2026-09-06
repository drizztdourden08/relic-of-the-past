/* @layer shared-game @kind logic */
/**
 * Cut a token stream into the boxes a player actually pages through.
 *
 * A screen ends at a wait-for-button and nowhere else. A scroll is NOT a cut:
 * it shifts the box up a line and parks the pen on the last row, so the text
 * either side of it shares one box. Because the engine clears nothing at a
 * wait, the walk carries straight on across the cut. That is why each screen
 * reports the rows VISIBLE while it waits, leftovers from earlier screens
 * included, and not only the rows it wrote itself.
 *
 * Trailing content after the last wait becomes a final screen with
 * `waitsForButton: false`; so does a stream that never waits at all. A stream
 * ending exactly on its wait adds no such screen, because nothing was drawn after it.
 *
 * For an overflow audit use `measureRows`: it reports every run the pen closed,
 * including ones a later run overwrote, whereas the rows here are the surviving
 * visible state.
 */
import { resolveRefs } from '../glossary/resolve-refs';
import type { GlossaryTerm, Token } from '../types';
import { applyToken, createPen, visibleRows } from './box-pen';
import type { LayoutOptions } from './layout-plan';
import { layoutPlan } from './layout-plan';
import type { GlyphMetrics, ScreenFit } from './types';

const splitScreens = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  opts?: LayoutOptions,
): ScreenFit[] => {
  const plan = layoutPlan(metrics, opts);
  const pen = createPen();
  const screens: ScreenFit[] = [];
  let editsAtCut = pen.edits;

  for (const token of resolveRefs(tokens, glossary)) {
    if (applyToken(pen, token, plan) !== 'wait') continue;
    screens.push({ index: screens.length + 1, rows: visibleRows(pen), waitsForButton: true });
    editsAtCut = pen.edits;
  }

  if (pen.edits > editsAtCut) {
    screens.push({ index: screens.length + 1, rows: visibleRows(pen), waitsForButton: false });
  }

  return screens;
};

export { splitScreens };
