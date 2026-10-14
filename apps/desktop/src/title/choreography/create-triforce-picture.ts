/* @layer renderer-hud @kind logic */
import { PIECE_SIZE } from '@rotp/game-data';
import type { TriforcePicture } from './choreography.type';
import { paintTriforceTile } from './paint-triforce-tile';
import { TILES_PER_ROW } from './triforce.constants';

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
      for (let tx = 0; tx < TILES_PER_ROW; tx++) paintTriforceTile({ px, block, rgb, tx, ty });
    }
    ctx.putImageData(image, 0, 0);
  };
  return { canvas, update };
};

export { createTriforcePicture };
