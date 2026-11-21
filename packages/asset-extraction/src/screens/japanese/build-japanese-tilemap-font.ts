/* @layer shared-asset-extraction @kind logic */
import { SHEET_GLYPH_BYTES, TILE_BYTES } from '../../japanese/font/japanese-font.constants';
import {
  BOTTOM_LEFT_TILE, BOTTOM_TILE_OFFSET, GLYPHS_PER_ROW, TILEMAP_GLYPHS, TILES_PER_ROW, TOP_LEFT_TILE,
} from './japanese-screens.constants';

const tileOf = (glyph: number): number =>
  Math.floor(glyph / GLYPHS_PER_ROW) * TILES_PER_ROW + (glyph % GLYPHS_PER_ROW);

const sheetTile = (sheet: Uint8Array, glyph: number, tile: number): Uint8Array => {
  const at = glyph * SHEET_GLYPH_BYTES + tile * TILE_BYTES;
  return sheet.subarray(at, at + TILE_BYTES);
};

const buildJapaneseTilemapFont = (sheet: Uint8Array): Uint8Array => {
  const out = new Uint8Array(TILEMAP_GLYPHS * 2 * TILE_BYTES);
  for (let glyph = 0; glyph < TILEMAP_GLYPHS; glyph += 1) {
    const top = tileOf(glyph);
    out.set(sheetTile(sheet, glyph, TOP_LEFT_TILE), top * TILE_BYTES);
    out.set(sheetTile(sheet, glyph, BOTTOM_LEFT_TILE), (top + BOTTOM_TILE_OFFSET) * TILE_BYTES);
  }
  return out;
};

export { buildJapaneseTilemapFont };
