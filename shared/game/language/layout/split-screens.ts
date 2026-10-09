/* @layer shared-game @kind logic */
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
