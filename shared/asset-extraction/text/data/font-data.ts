/* @layer shared-asset-extraction @kind data */
/**
 * Per-language dialogue font sources.
 *
 * Each language stores its 8x8 2bpp glyph tiles and a per-glyph width table at
 * language-specific ROM addresses. The official EU ROMs (de/fr/fr-c) keep their
 * font at a different bank than the US ROM; the translation hacks reuse the US
 * font slot but vary the glyph count.
 *
 * Ported from: core/zelda3/assets/sprite_sheets.py kFontTypes.
 */

/** Every dialogue font is 256 tiles of 16 bytes (8x8, 2bpp). */
const FONT_TILE_COUNT = 256;
const FONT_TILE_BYTES = FONT_TILE_COUNT * 16;

interface FontSource {
  /** SNES address of the 256-tile 2bpp glyph sheet. */
  tileAddr: number;
  /** SNES address of the per-glyph width table. */
  widthAddr: number;
  /** Number of glyphs in the width table (the language's effective alphabet size). */
  widthCount: number;
}

const kFontTypes: Record<string, FontSource> = {
  us: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  de: { tileAddr: 0xcc6e8, widthAddr: 0x8cdecf, widthCount: 112 },
  fr: { tileAddr: 0xcc6e8, widthAddr: 0x8cdeaf, widthCount: 112 },
  'fr-c': { tileAddr: 0xcd078, widthAddr: 0x8ce83f, widthCount: 112 },
  en: { tileAddr: 0x8e8000, widthAddr: 0x8ecaff, widthCount: 102 },
  es: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  pl: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  pt: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 121 },
  redux: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  nl: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
  sv: { tileAddr: 0x8e8000, widthAddr: 0x8ecadf, widthCount: 99 },
};

export { kFontTypes, FONT_TILE_COUNT, FONT_TILE_BYTES };
export type { FontSource };
