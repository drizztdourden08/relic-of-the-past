/* @layer shared-game @kind logic */
import type { GlyphMetrics } from '../types';
import { glyphIndexOf, matchGlyphs, widthOf } from '../glyph-metrics';
import type { LayoutOptions, LayoutPlan } from './layout-plan.type';
import { DIGITS, MAX_NAME_GLYPHS } from './layout-plan.constants';

const widestOf = (candidates: number[], metrics: GlyphMetrics): number => candidates.reduce(
  (best, index) => (widthOf(index, metrics) > widthOf(best, metrics) ? index : best),
  candidates[0] ?? 0,
);

const everyGlyph = (metrics: GlyphMetrics): number[] => metrics.alphabet.map((_, index) => index);

const digitGlyphs = (metrics: GlyphMetrics): number[] => DIGITS.flatMap(digit => {
  const match = glyphIndexOf(digit, 0, metrics);
  return match === null ? [] : [match.index];
});

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

export { layoutPlan };
