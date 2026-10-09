/* @layer bridge-wasm @kind logic */
import { wasmGetDialogFont, wasmGetDialogPalette } from '../../bridge/dialog';
import type { GlyphAtlas } from './glyph-atlas.type';
import { BODY_ENTRY, CACHE_LIMIT, SHEET_TILES, WIDTH_TABLE } from './glyph-atlas.constants';
import { glyphAtlasCache } from './glyph-atlas-cache';
import { buildAtlas } from './build-atlas';

const atlasKey = (ptr: number, size: number, palette: number[]): string => `${ptr}:${size}:${palette.join(',')}`;

const getGlyphAtlas = (body?: number): GlyphAtlas | null => {
  const sheet = wasmGetDialogFont(SHEET_TILES);
  const widthTable = wasmGetDialogFont(WIDTH_TABLE);
  const live = wasmGetDialogPalette();
  if (!sheet || !widthTable || !live) return null;
  const palette = body === undefined ? live : live.map((word, entry) => (entry === BODY_ENTRY ? body : word));
  const key = atlasKey(sheet.ptr, sheet.size, palette);
  const known = glyphAtlasCache.get(key);
  if (known) return known;
  const tiles = sheet.heap.slice(sheet.ptr, sheet.ptr + sheet.size);
  const widths = widthTable.heap.slice(widthTable.ptr, widthTable.ptr + widthTable.size);
  const atlas = buildAtlas(tiles, widths, palette, key);
  if (glyphAtlasCache.size >= CACHE_LIMIT) glyphAtlasCache.clear();
  if (atlas) glyphAtlasCache.set(key, atlas);
  return atlas;
};

export { getGlyphAtlas };
