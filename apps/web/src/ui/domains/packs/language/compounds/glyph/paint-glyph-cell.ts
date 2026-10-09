/* @layer renderer-components @kind logic */
import { decode2bppTile } from '@shared/asset-extraction/graphics/bitplane-decoder';
import { edgeAt, sheetHolds, topTileOf } from './glyph-cell-geometry';
import { BOTTOM_TILE_STEP, CELL_H, CELL_W, RAMP_FILL, TILE_BYTES, TILE_SIDE } from './glyph.constants';
import type { GlyphStore } from './glyph.type';

const paintTile = (
  ctx: CanvasRenderingContext2D,
  tiles: Uint8Array,
  tileIndex: number,
  rowOffset: number,
  store: GlyphStore,
): void => {
  const pixels = decode2bppTile(tiles, tileIndex * TILE_BYTES);

  for (let y = 0; y < TILE_SIDE; y += 1) {
    const top = edgeAt(rowOffset + y, store.height, CELL_H);
    const bottom = edgeAt(rowOffset + y + 1, store.height, CELL_H);

    for (let x = 0; x < TILE_SIDE; x += 1) {
      const value = pixels[y * TILE_SIDE + x];
      if (value === 0) continue;
      const left = edgeAt(x, store.width, CELL_W);
      ctx.fillStyle = RAMP_FILL[value];
      ctx.fillRect(left, top, edgeAt(x + 1, store.width, CELL_W) - left, bottom - top);
    }
  }
};

const paintGlyphCell = (
  canvas: HTMLCanvasElement,
  tiles: Uint8Array,
  glyph: number,
  store: GlyphStore,
): boolean => {
  if (!sheetHolds(glyph, Math.floor(tiles.length / TILE_BYTES))) return false;

  if (canvas.width !== store.width) canvas.width = store.width;
  if (canvas.height !== store.height) canvas.height = store.height;

  const ctx = canvas.getContext('2d');
  if (ctx === null) return false;

  ctx.clearRect(0, 0, store.width, store.height);
  const top = topTileOf(glyph);
  paintTile(ctx, tiles, top, 0, store);
  paintTile(ctx, tiles, top + BOTTOM_TILE_STEP, TILE_SIDE, store);
  return true;
};

export { paintGlyphCell };
