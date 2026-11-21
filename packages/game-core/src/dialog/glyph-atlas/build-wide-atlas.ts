/* @layer bridge-wasm @kind logic */
import type { GlyphAtlas } from './glyph-atlas.type';
import {
  CELL_H, COLUMNS, TILE_BYTES, WIDE_BOTTOM_TILE, WIDE_CELL_W, WIDE_GLYPHS, WIDE_GLYPH_TILES, WIDE_HALF,
  WIDE_RIGHT_TILE,
} from './glyph-atlas.constants';
import { paintTile } from './paint-tile';
import { rampOf } from './ramp-of';

const buildWideAtlas = (tiles: Uint8Array, widths: Uint8Array, palette: number[], key: string): GlyphAtlas | null => {
  const ramp = rampOf(palette);
  const canvas = document.createElement('canvas');
  canvas.width = COLUMNS * WIDE_CELL_W;
  canvas.height = (WIDE_GLYPHS / COLUMNS) * CELL_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const tileCount = Math.floor(tiles.length / TILE_BYTES);
  for (let glyph = 0; glyph < WIDE_GLYPHS; glyph++) {
    const first = glyph * WIDE_GLYPH_TILES;
    if (first + WIDE_GLYPH_TILES > tileCount) break;
    const x = (glyph % COLUMNS) * WIDE_CELL_W;
    const y = Math.floor(glyph / COLUMNS) * CELL_H;
    paintTile(ctx, { tiles, tile: first, x, y, ramp });
    paintTile(ctx, { tiles, tile: first + WIDE_BOTTOM_TILE, x, y: y + WIDE_HALF, ramp });
    paintTile(ctx, { tiles, tile: first + WIDE_RIGHT_TILE, x: x + WIDE_HALF, y, ramp });
    paintTile(ctx, { tiles, tile: first + WIDE_RIGHT_TILE + WIDE_BOTTOM_TILE, x: x + WIDE_HALF, y: y + WIDE_HALF, ramp });
  }
  return { canvas, widths, key };
};

export { buildWideAtlas };
