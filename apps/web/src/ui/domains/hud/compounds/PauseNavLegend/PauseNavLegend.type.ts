/* @layer renderer-hud @kind types */
import type { GlyphSource } from '@shared/types/hud';

/** One glyph-and-verb pair. A pair may carry two glyphs, for previous/next screen. */
interface NavLegendEntry {
  /** Stable key; also the fallback text when no pack draws the control. */
  id: string;
  /** Resolved glyphs, in draw order. Empty when nothing has artwork for it. */
  glyphs: readonly GlyphSource[];
  /** Text the pack could not draw, e.g. a keyboard key with no cap art. */
  fallback: string;
  /** What the button does here, in the menu's own words. */
  verb: string;
}

interface PauseNavLegendProps {
  entries: readonly NavLegendEntry[];
  /** Width of the strip in SNES pixels, which is the full play field. */
  width: number;
  scale: number;
  spritesBase: string;
}

export type { NavLegendEntry, PauseNavLegendProps };
