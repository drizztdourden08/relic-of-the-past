/* @layer renderer-components @kind types */
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language';

type GlyphCharProps = {
  name: string;
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

export type { GlyphCharProps };
