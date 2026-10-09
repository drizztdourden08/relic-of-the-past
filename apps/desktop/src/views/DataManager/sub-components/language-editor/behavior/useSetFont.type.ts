/* @layer renderer-components @kind types */
import type { GlyphMetrics, GlyphSheet } from '@rotp/languages';

type SetFontState = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
  loading: boolean;
};

export type { SetFontState };
