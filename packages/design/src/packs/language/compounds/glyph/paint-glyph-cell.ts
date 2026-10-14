/* @layer renderer-components @kind logic */
import { decode2bppTile } from '@rotp/asset-extraction';
import { edgeAt, sheetHolds, topTileOf } from './glyph-cell-geometry';
import { BOTTOM_TILE_STEP, CELL_H, CELL_W, RAMP_FILL, TILE_BYTES, TILE_SIDE } from './glyph.constants';
import type { GlyphStore, TileJob } from './glyph.type';

const paintTile = (ctx: CanvasRenderingContext2D, store: GlyphStore, tile: TileJob): void => {
  const { tiles, tileIndex, rowOffset } = tile;
  const pixels = decode2bppTile(tiles, tileIndex * TILE_BYTES);

  for (let y = 0; y < TILE_SIDE; y += 1) {
    const top = edgeAt(rowOffset + y, store.height, CELL_H);
    const bottom = edgeAt(rowOffset + y + 1, store.height, CELL_H);

    for (let x = 0; x < TILE_SIDE; x += 1) {
      const value = pixels[y * TILE_SIDE + x] ?? 0;
      if (value === 0) continue;
      const fill = RAMP_FILL[value];
      if (fill === undefined) throw new Error(`The glyph ramp has no shade ${value}`);
      const left = edgeAt(x, store.width, CELL_W);
      ctx.fillStyle = fill;
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
  paintTile(ctx, store, { tiles, tileIndex: top, rowOffset: 0 });
  paintTile(ctx, store, { tiles, tileIndex: top + BOTTOM_TILE_STEP, rowOffset: TILE_SIDE });
  return true;
};

export { paintGlyphCell };
