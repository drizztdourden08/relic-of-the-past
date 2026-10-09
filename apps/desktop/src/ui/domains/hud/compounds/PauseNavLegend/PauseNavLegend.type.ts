/* @layer renderer-hud @kind types */
import type { GlyphSource } from '@rotp/input-mapping';

interface NavLegendEntry {
  id: string;
  glyphs: readonly GlyphSource[];
  fallback: string;
  verb: string;
}

interface PauseNavLegendProps {
  entries: readonly NavLegendEntry[];
  width: number;
  scale: number;
  spritesBase: string;
}

export type { NavLegendEntry, PauseNavLegendProps };
