/* @layer renderer-components @kind logic */
/**
 * Paints one character of a language pack's own font into a canvas.
 *
 * The pixels come from the pack's `font.bin`, which is the same data the game
 * draws from. They are decoded here, not fetched as a picture, so a picture
 * character shows up for every pack there is, with nothing to extract or
 * install first.
 *
 * Two sizes are in play and they are kept apart on purpose. The CSS size belongs
 * to the stylesheet, where one cell of the line is defined; the BACKING STORE is
 * sized here, in device pixels, from the box the stylesheet gave the canvas. Pixel
 * art stretched from a smaller bitmap is the one thing never to do, so the store
 * is the real pixel count of the box and every rectangle is snapped to it.
 */
import { decode2bppTile } from '@shared/asset-extraction/graphics/bitplane-decoder';
import { GLYPH_RAMP } from '@shared/asset-extraction/text/data/glyph-ramp';
import {
  edgeAt, sheetHolds, topTileOf, BOTTOM_TILE_STEP, CELL_H, CELL_W, TILE_BYTES,
} from './glyph-cell-geometry';

/** Pixels along one edge of a tile. */
const TILE_SIDE = 8;

/** The ramp as fill styles, built once. Value 0 draws nothing, so it is never read. */
const RAMP_FILL = GLYPH_RAMP.map(([r, g, b]) => `rgb(${r} ${g} ${b})`);

/** The canvas's backing store, in device pixels. */
type Store = {
  width: number;
  height: number;
};

/**
 * One tile, `rowOffset` source rows down the cell. Vertical edges are computed
 * per row and horizontal edges per column, both through the one mapping, so
 * neighbouring pixels meet exactly.
 */
const paintTile = (
  ctx: CanvasRenderingContext2D,
  tiles: Uint8Array,
  tileIndex: number,
  rowOffset: number,
  store: Store,
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

/**
 * The bitmap size the canvas needs, read from its laid-out box at the display's
 * pixel ratio. Null when the box has no size yet. A cell in a container that has
 * not been laid out would otherwise be baked at one pixel square and never
 * corrected.
 *
 * A READ only: it forces layout, so a caller painting many cells measures them
 * all first and resizes after (see `useGlyphCanvas`), which keeps a whole batch
 * to one reflow instead of one per cell.
 */
const measureStore = (canvas: HTMLCanvasElement, ratio: number): Store | null => {
  const box = canvas.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return null;
  return {
    width: Math.max(1, Math.round(box.width * ratio)),
    height: Math.max(1, Math.round(box.height * ratio)),
  };
};

/**
 * Draw character `glyph` of `tiles` into a canvas sized to `store`, filling it
 * exactly. False means nothing was drawn, either because the sheet cannot spell
 * the index or because there is no 2d context. The caller then leaves the cell
 * empty instead of showing something that is not the character.
 */
const paintGlyphCell = (
  canvas: HTMLCanvasElement,
  tiles: Uint8Array,
  glyph: number,
  store: Store,
): boolean => {
  if (!sheetHolds(glyph, Math.floor(tiles.length / TILE_BYTES))) return false;

  // Assigning either dimension clears the bitmap, so only a real change is written.
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

export { measureStore, paintGlyphCell };
export type { Store as GlyphStore };
