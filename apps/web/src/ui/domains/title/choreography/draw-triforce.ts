/* @layer renderer-hud @kind logic */
/**
 * The three triangles, from the core's own picture: the poly thread's 0x800-byte block of 4bpp
 * tiles decoded into a 64x64 image with the eight colours it draws with, placed three times where
 * the intro's sprites are, the third mirrored. The spin and the zoom are inside the block.
 */
import { MIRRORED_PIECE, PIECE_SIZE } from '@shared/game/title/title-layout';
import type { TitlePiece } from '@shared/game/title/title-frame.type';

const TILE_BYTES = 32;
const TILES_PER_ROW = 8;
/** The block's tile rows in picture order: the sprite grid reads chars 0x80, 0x90, 0xa0, 0xb0, 0x88... */
const TILE_ROW_BASE = [0x00, 0x10, 0x20, 0x30, 0x08, 0x18, 0x28, 0x38] as const;

const snesToRgb = (word: number): [number, number, number] => [(word & 31) << 3, ((word >> 5) & 31) << 3, ((word >> 10) & 31) << 3];

interface TriforcePicture {
  canvas: HTMLCanvasElement;
  update: (block: Uint8Array, palette: number[]) => void;
}

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
        const at = (TILE_ROW_BASE[ty] + tx) * TILE_BYTES;
        for (let y = 0; y < 8; y++) {
          const p0 = block[at + y * 2], p1 = block[at + y * 2 + 1];
          const p2 = block[at + 16 + y * 2], p3 = block[at + 16 + y * 2 + 1];
          for (let x = 0; x < 8; x++) {
            const bit = 7 - x;
            const c = ((p0 >> bit) & 1) | (((p1 >> bit) & 1) << 1) | (((p2 >> bit) & 1) << 2) | (((p3 >> bit) & 1) << 3);
            const o = ((ty * 8 + y) * PIECE_SIZE + tx * 8 + x) * 4;
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

const drawTriforce = (ctx: CanvasRenderingContext2D, picture: TriforcePicture, pieces: readonly TitlePiece[], frameX: number, frameY: number): void => {
  pieces.forEach((piece, k) => {
    const x = frameX + piece.x;
    const y = frameY + piece.y;
    if (k !== MIRRORED_PIECE) {
      ctx.drawImage(picture.canvas, x, y);
      return;
    }
    ctx.save();
    ctx.translate(x + PIECE_SIZE, y);
    ctx.scale(-1, 1);
    ctx.drawImage(picture.canvas, 0, 0);
    ctx.restore();
  });
};

export { createTriforcePicture, drawTriforce };
export type { TriforcePicture };
