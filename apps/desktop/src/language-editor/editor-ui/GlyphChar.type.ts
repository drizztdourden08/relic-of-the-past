/* @layer renderer-components @kind types */
import type { GlyphMetrics, GlyphSheet } from '@rotp/languages';

type GlyphCharProps = {
  name: string;
  sheet: GlyphSheet | null;
  metrics: GlyphMetrics | null;
};

export type { GlyphCharProps };
