/* @layer renderer-components @kind types */
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language/layout/types';

type SetFontState = {
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
  loading: boolean;
};

export type { SetFontState };
