/* @layer shared-asset-extraction @kind logic */
import { SNES_4BPP_TILE_BYTES, TILE_PIXELS } from './gba-native.constants';

const rowPlanes = (pixels: Uint8Array, y: number): number[] => {
  const planes = [0, 0, 0, 0];
  for (let x = 0; x < 8; x++) {
    const color = pixels[y * 8 + x] ?? 0;
    if (color > 15) throw new Error(`SNES 4bpp color index ${color} is out of range`);
    const bit = 7 - x;
    for (const [plane, value] of planes.entries()) planes[plane] = value | (((color >>> plane) & 1) << bit);
  }
  return planes;
};

const encodeSnesPlanar4bppTile =(pixels: Uint8Array): Buffer => {
  if (pixels.length !== TILE_PIXELS) throw new Error('SNES tile requires exactly 64 pixels');
  const result = Buffer.alloc(SNES_4BPP_TILE_BYTES);
  for (let y = 0; y < 8; y++) {
    const [p0 = 0, p1 = 0, p2 = 0, p3 = 0] = rowPlanes(pixels, y);
    result[y * 2] = p0;
    result[y * 2 + 1] = p1;
    result[16 + y * 2] = p2;
    result[16 + y * 2 + 1] = p3;
  }
  return result;
};

export { encodeSnesPlanar4bppTile };
