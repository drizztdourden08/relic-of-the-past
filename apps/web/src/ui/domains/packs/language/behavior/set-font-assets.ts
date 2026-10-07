/* @layer renderer-components @kind logic */
/**
 * A set's drawable font from its stored pair: the glyph tiles and widths (the set's own bytes)
 * plus the alphabet (from the extraction language table via the set's `base` code).
 */
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphMetrics, GlyphSheet } from '@shared/game/language/layout/types';
import type { SetFontBytes } from '@shared/storage/languages/types';

/** One set's drawable font: the tiles, and the metrics to place them. */
type SetFontAssets = {
  sheet: GlyphSheet;
  metrics: GlyphMetrics;
};

/** The font to draw with, or null when the base language is unknown; callers then draw nothing. */
const setFontAssets = (font: SetFontBytes, base: string | null): SetFontAssets | null => {
  const config = base ? kLanguages[base] ?? null : null;
  if (!config) return null;
  // Copied: the host may pass a pooled view whose byteOffset is not zero, and
  // every offset below is tile-relative.
  return {
    sheet: { tiles: Uint8Array.from(font.fontData) },
    metrics: { widths: Uint8Array.from(font.fontWidth), alphabet: config.alphabet },
  };
};

export { setFontAssets };
export type { SetFontAssets };
