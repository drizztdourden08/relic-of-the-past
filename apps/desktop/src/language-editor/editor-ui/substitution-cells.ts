/* @layer renderer-components @kind logic */
import { layoutPlan, widthOf } from '@rotp/languages';
import type { GlyphMetrics } from '@rotp/languages';
import type { SubstitutionCells } from './substitution-cells.type';

const kNameStandIn = 'PLAYER';

const kNumberStandIn = '0';

const substitutionCells = (
  isName: boolean,
  metrics: GlyphMetrics | null,
): SubstitutionCells => {
  const text = isName ? kNameStandIn : kNumberStandIn;
  if (metrics === null) return { text, cellPx: null };

  const plan = layoutPlan(metrics);
  const glyph = isName ? plan.nameGlyphs[0] : plan.numberGlyph;
  return { text, cellPx: widthOf(glyph ?? 0, metrics) };
};

export { substitutionCells };
