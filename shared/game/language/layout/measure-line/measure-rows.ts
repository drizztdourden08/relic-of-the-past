/* @layer shared-game @kind logic */
import type { GlossaryTerm, Token } from '../../types';
import type { LayoutOptions } from '../layout-plan';
import type { GlyphMetrics, RowFit } from '../types';
import { measureRowsDetailed } from './measure-rows-detailed';

const measureRows = (
  tokens: Token[],
  metrics: GlyphMetrics,
  glossary: GlossaryTerm[],
  opts?: LayoutOptions,
): RowFit[] => measureRowsDetailed(tokens, metrics, glossary, opts).rows;

export { measureRows };
