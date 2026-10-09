/* @layer renderer-hud @kind logic */
import { PIECE_SIZE } from '@rotp/game-data';
import type { TriforcePicture } from './choreography.type';
import { POLY_TILE_ROW_ORDER, SECOND_BITPLANE_PAIR_OFFSET, TILE_BYTES, TILE_PIXELS, TILES_PER_ROW } from './triforce.constants';

const snesToRgb = (word: number): [number, number, number] => [(word & 31) << 3, ((word >> 5) & 31) << 3, ((word >> 10) & 31) << 3];

const createTriforcePicture = (): TriforcePicture => {
  const canvas = document.createElement('canvas');
  canvas.width = PIECE_SIZE;
  canvas.height = PIECE_SIZE;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const image = ctx.createImageData(PIECE_SIZE, PIECE_SIZE);
  const update = (block: Uint8Array, palette: number[]): void => {
    const rgb = palette.map(snesToRgb);
    const px = image.data;
    for (let ty = 0; ty < TILES_PER_ROW; ty++) {
      for (let tx = 0; tx < TILES_PER_ROW; tx++) {
        const at = (POLY_TILE_ROW_ORDER[ty] + tx) * TILE_BYTES;
        for (let y = 0; y < TILE_PIXELS; y++) {
          const p0 = block[at + y * 2], p1 = block[at + y * 2 + 1];
          const p2 = block[at + SECOND_BITPLANE_PAIR_OFFSET + y * 2], p3 = block[at + SECOND_BITPLANE_PAIR_OFFSET + y * 2 + 1];
          for (let x = 0; x < TILE_PIXELS; x++) {
            const bit = 7 - x;
            const c = ((p0 >> bit) & 1) | (((p1 >> bit) & 1) << 1) | (((p2 >> bit) & 1) << 2) | (((p3 >> bit) & 1) << 3);
            const o = ((ty * TILE_PIXELS + y) * PIECE_SIZE + tx * TILE_PIXELS + x) * 4;
            if (c === 0 || c >= rgb.length) {
              px[o + 3] = 0;
              continue;
            }
            [px[o], px[o + 1], px[o + 2]] = rgb[c];
            px[o + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(image, 0, 0);
  };
  return { canvas, update };
};

export { createTriforcePicture };
