/* @layer shared-game @kind types */
import type { GlyphMetrics } from '../types';

type LayoutOptions = {
  nameSample?: string;
  numberDigit?: string;
};

type LayoutPlan = {
  metrics: GlyphMetrics;
  nameGlyphs: number[];
  nameUnmatched: string[];
  numberGlyph: number;
};

export type { LayoutOptions, LayoutPlan };
