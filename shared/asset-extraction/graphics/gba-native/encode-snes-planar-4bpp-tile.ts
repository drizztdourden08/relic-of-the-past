/* @layer shared-asset-extraction @kind logic */
import { SNES_4BPP_TILE_BYTES, TILE_PIXELS } from './gba-native.constants';

const encodeSnesPlanar4bppTile = (pixels: Uint8Array): Buffer => {
  if (pixels.length !== TILE_PIXELS) throw new Error('SNES tile requires exactly 64 pixels');
  const result = Buffer.alloc(SNES_4BPP_TILE_BYTES);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const color = pixels[y * 8 + x];
      if (color > 15) throw new Error(`SNES 4bpp color index ${color} is out of range`);
      const bit = 7 - x;
      result[y * 2] |= (color & 1) << bit;
      result[y * 2 + 1] |= ((color >>> 1) & 1) << bit;
      result[16 + y * 2] |= ((color >>> 2) & 1) << bit;
      result[16 + y * 2 + 1] |= ((color >>> 3) & 1) << bit;
    }
  }
  return result;
};

export { encodeSnesPlanar4bppTile };
