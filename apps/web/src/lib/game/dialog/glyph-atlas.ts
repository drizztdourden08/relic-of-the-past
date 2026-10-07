/* @layer bridge-wasm @kind logic */
/**
 * The active language's dialogue font as one offscreen canvas, drawn from the glyph sheet the core
 * itself renders from (WasmGetDialogFont). Glyph c sits at column c & 15, row c >> 4, in 8 by 16
 * cells, painted with the palette the box is drawing with (live CGRAM, so a [Color] line or a
 * different box palette shows as the game shows it). Built once per font and palette, never per
 * frame.
 */
import { decode2bppTile } from '@shared/asset-extraction/graphics/bitplane-decoder';
import { snesToRgba } from '@shared/asset-extraction/graphics/palette';
import { wasmGetDialogFont, wasmGetDialogPalette } from '../bridge/dialog';

const CELL_W = 8;
const CELL_H = 16;
const COLUMNS = 16;
const GLYPHS = 128;
const TILE_BYTES = 16;
const TILES_PER_GLYPH_ROW = 32;
const BOTTOM_TILE_STEP = 16;

interface GlyphAtlas {
  canvas: HTMLCanvasElement;
  widths: Uint8Array;
  /** Identity of the sheet this atlas was built from. */
  key: string;
}

let cached: GlyphAtlas | null = null;

/** Fill styles for the four palette entries; entry 0 is the transparent ground and never painted. */
const rampOf = (palette: number[]): string[] =>
  palette.map((word) => { const [r, g, b] = snesToRgba(word); return `rgb(${r} ${g} ${b})`; });

const paintTile = (ctx: CanvasRenderingContext2D, tiles: Uint8Array, tile: number, x: number, y: number, ramp: string[]): void => {
  const pixels = decode2bppTile(tiles, tile * TILE_BYTES);
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const value = pixels[py * 8 + px];
      if (value === 0) continue;
      ctx.fillStyle = ramp[value];
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
    paintTile(ctx, tiles, top, x, y, ramp);
    paintTile(ctx, tiles, top + BOTTOM_TILE_STEP, x, y + 8, ramp);
  }
  return { canvas, widths, key };
};

/** A sheet is its heap address and size (both change with the language) plus the palette words. */
const atlasKey = (ptr: number, size: number, palette: number[]): string => `${ptr}:${size}:${palette.join(',')}`;

const getGlyphAtlas = (): GlyphAtlas | null => {
  const sheet = wasmGetDialogFont(0);
  const widthTable = wasmGetDialogFont(1);
  const palette = wasmGetDialogPalette();
  if (!sheet || !widthTable || !palette) return null;
  const key = atlasKey(sheet.ptr, sheet.size, palette);
  if (cached && cached.key === key) return cached;
  const tiles = sheet.heap.slice(sheet.ptr, sheet.ptr + sheet.size);
  const widths = widthTable.heap.slice(widthTable.ptr, widthTable.ptr + widthTable.size);
  cached = buildAtlas(tiles, widths, palette, key);
  return cached;
};

const clearGlyphAtlas = (): void => {
  cached = null;
};

export { getGlyphAtlas, clearGlyphAtlas, CELL_W, CELL_H, COLUMNS };
export type { GlyphAtlas };
