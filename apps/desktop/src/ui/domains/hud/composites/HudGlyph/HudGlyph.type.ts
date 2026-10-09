/* @layer renderer-hud @kind types */
import type { GlyphSource } from '@shared/types/hud';

interface HudGlyphProps {
  source: GlyphSource;
  scale: number;
  size?: number;
}

export type { HudGlyphProps };
