/* @layer bridge-wasm @kind logic */
import { decode2bppTile, snesToRgba } from '@rotp/asset-extraction';
import type { GlyphAtlas, TileSpot } from './glyph-atlas.type';
import {
  BOTTOM_TILE_STEP, CELL_H, CELL_W, COLUMNS, GLYPHS, TILE_BYTES, TILES_PER_GLYPH_ROW,
} from './glyph-atlas.constants';

const rampOf = (palette: number[]): string[] =>
  palette.map((word) => { const [r, g, b] = snesToRgba(word); return `rgb(${r} ${g} ${b})`; });

const paintTile = (ctx: CanvasRenderingContext2D, spot: TileSpot): void => {
  const { tiles, tile, x, y, ramp } = spot;
  const pixels = decode2bppTile(tiles, tile * TILE_BYTES);
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const value = pixels[py * 8 + px];
      if (value === 0) continue;
      const color = value === undefined ? undefined : ramp[value];
      if (color === undefined) throw new RangeError(`glyph pixel ${String(value)} has no palette color`);
      ctx.fillStyle = color;
      ctx.fillRect(x + px, y + py, 1, 1);
    }
  }
};

const buildAtlas = (tiles: Uint8Array, widths: Uint8Array, palette: number[], key: string): GlyphAtlas | null => {
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
