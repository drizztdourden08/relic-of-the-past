/* @layer shared-game @kind logic */
import { resolveRefs } from '../../glossary/resolve-refs';
import type { GlossaryTerm, Token } from '../../types';
import { applyToken, closeRun, createPen } from '../box-pen';
import type { LayoutOptions } from '../layout-plan';
import { layoutPlan } from '../layout-plan';
import type { GlyphMetrics } from '../types';
import type { RowMeasurement } from './measure-line.type';

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

export { measureRowsDetailed };
