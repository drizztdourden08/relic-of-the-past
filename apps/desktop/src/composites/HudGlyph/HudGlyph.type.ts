/* @layer renderer-hud @kind types */
import type { GlyphSource } from '@rotp/input-mapping';

interface HudGlyphProps {
  source: GlyphSource;
  scale: number;
  size?: number;
}

export type { HudGlyphProps };
