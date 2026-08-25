/* @layer renderer-components @kind logic */
/**
 * What a SUBSTITUTION is worth on the row, at worst.
 *
 * Neither runtime value has a fixed width, so the chip standing in for one has
 * to reserve the most it could ever take — otherwise a line that fits on screen
 * is a line that breaks in the game as soon as a player picks a long name.
 *
 * The numbers are not invented here. `layoutPlan` is the same worst case the
 * measurement walk charges: the name substitution draws six of the widest glyph
 * in the language (six characters is the cap on a player's file name) and the
 * number substitution draws exactly one digit, the widest one. Reading the plan
 * rather than restating its rule is what keeps the chip on screen and the
 * gutter's figure beside it describing one line rather than two.
 */
import { layoutPlan, widthOf } from '@shared/game/language';
import type { GlyphMetrics } from '@shared/game/language';

/** The stand-in text, and the advance ONE of its characters is billed. */
type SubstitutionCells = {
  text: string;
  /** Per-character advance in game pixels, or null with no font to ask. */
  cellPx: number | null;
};

/** Six characters, the cap on a player's file name. */
const kNameStandIn = 'PLAYER';

/** One digit, which is exactly what the number substitution emits. */
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
export type { SubstitutionCells };
