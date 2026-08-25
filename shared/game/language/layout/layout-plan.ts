/* @layer shared-game @kind logic */
/**
 * What the two runtime substitutions are worth in pixels, decided once before a
 * measurement walk starts.
 *
 * Neither variable has a fixed width, so a fit prediction has to commit to
 * something:
 *
 * - The player-name substitution draws 1..6 glyphs (the entry field holds six
 *   characters and trailing spaces are trimmed), and every one of them counts
 *   toward the row exactly like literal text. With no sample supplied the plan
 *   assumes the WORST CASE — six of the widest glyph in the language's table —
 *   so a row reported safe is safe for every name a player can enter. Pass
 *   `nameSample` to measure one concrete name instead, for a preview that
 *   matches what a given save would show.
 * - The number substitution emits EXACTLY ONE digit glyph. With no digit
 *   supplied the plan uses the widest digit in the alphabet, again so a safe
 *   verdict holds whichever value the game ends up printing.
 */
import type { GlyphMetrics } from './types';
import { glyphIndexOf, matchGlyphs, widthOf } from './glyph-metrics';

/** Glyphs the player-name substitution can occupy at most. */
const MAX_NAME_GLYPHS = 6;

/** The digit set the number substitution draws from, in alphabet spelling. */
const kDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Caller control over how the substitutions are measured. */
type LayoutOptions = {
  /**
   * A concrete name to measure. Trailing spaces are trimmed and the result is
   * capped at six glyphs, matching what the engine substitutes.
   */
  nameSample?: string;
  /** A specific digit for the number substitution. Defaults to the widest one. */
  numberDigit?: string;
};

/** The substitutions resolved to real glyph indices, ready to draw and total. */
type LayoutPlan = {
  metrics: GlyphMetrics;
  nameGlyphs: number[];
  /** Anything in `nameSample` the alphabet could not draw. */
  nameUnmatched: string[];
  numberGlyph: number;
};

const widestOf = (candidates: number[], metrics: GlyphMetrics): number => candidates.reduce(
  (best, index) => (widthOf(index, metrics) > widthOf(best, metrics) ? index : best),
  candidates[0] ?? 0,
);

const everyGlyph = (metrics: GlyphMetrics): number[] => metrics.alphabet.map((_, index) => index);

const digitGlyphs = (metrics: GlyphMetrics): number[] => kDigits.flatMap(digit => {
  const match = glyphIndexOf(digit, 0, metrics);
  return match === null ? [] : [match.index];
});

/** Six of the widest glyph — the longest, widest name the field can hold. */
const worstCaseName = (metrics: GlyphMetrics): number[] => {
  const widest = widestOf(everyGlyph(metrics), metrics);
  return Array.from({ length: MAX_NAME_GLYPHS }, () => widest);
};

const numberGlyphFor = (metrics: GlyphMetrics, digit: string | undefined): number => {
  if (digit !== undefined) {
    const match = glyphIndexOf(digit, 0, metrics);
    if (match !== null) return match.index;
  }

  const digits = digitGlyphs(metrics);
  return widestOf(digits.length > 0 ? digits : everyGlyph(metrics), metrics);
};

const layoutPlan = (metrics: GlyphMetrics, opts?: LayoutOptions): LayoutPlan => {
  const sample = opts?.nameSample;
  const named = sample === undefined ? null : matchGlyphs(sample.replace(/ +$/, ''), metrics);

  return {
    metrics,
    nameGlyphs: named === null ? worstCaseName(metrics) : named.glyphs.slice(0, MAX_NAME_GLYPHS),
    nameUnmatched: named === null ? [] : named.unmatched,
    numberGlyph: numberGlyphFor(metrics, opts?.numberDigit),
  };
};

export { layoutPlan, MAX_NAME_GLYPHS };
export type { LayoutOptions, LayoutPlan };
