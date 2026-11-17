/* @layer bridge-wasm @kind logic */
import type { GlyphAtlas } from './glyph-atlas.type';
import {
  BOTTOM_TILE_STEP, CELL_H, CELL_W, COLUMNS, GLYPHS, TILE_BYTES, TILES_PER_GLYPH_ROW, WIDE_SHEET_BYTES,
} from './glyph-atlas.constants';
import { buildWideAtlas } from './build-wide-atlas';
import { paintTile } from './paint-tile';
import { rampOf } from './ramp-of';

const buildAtlas = (tiles: Uint8Array, widths: Uint8Array, palette: number[], key: string): GlyphAtlas | null => {
  if (tiles.length === WIDE_SHEET_BYTES) return buildWideAtlas(tiles, widths, palette, key);
  const ramp = rampOf(palette);
  const canvas = document.createElement('canvas');
  canvas.width = COLUMNS * CELL_W;
  canvas.height = (GLYPHS / COLUMNS) * CELL_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const tileCount = Math.floor(tiles.length / TILE_BYTES);
  for (let glyph = 0; glyph < GLYPHS; glyph++) {
    const top = (glyph >> 4) * TILES_PER_GLYPH_ROW + (glyph & 15);
    if (top + BOTTOM_TILE_STEP >= tileCount) break;
    const x = (glyph % COLUMNS) * CELL_W;
    const y = Math.floor(glyph / COLUMNS) * CELL_H;
    paintTile(ctx, { tiles, tile: top, x, y, ramp });
    paintTile(ctx, { tiles, tile: top + BOTTOM_TILE_STEP, x, y: y + 8, ramp });
  }
  return { canvas, widths, key };
};

export { buildAtlas };
