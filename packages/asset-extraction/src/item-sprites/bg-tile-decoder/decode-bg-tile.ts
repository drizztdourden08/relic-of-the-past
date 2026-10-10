/* @layer shared-asset-extraction @kind logic */
import { TILE_BYTES } from './bg-tile-decoder.constants';

const decodeBgTile = (sheet: Buffer, index: number): Uint8Array => {
  const offset = index * TILE_BYTES;
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y += 1) {
    const d0 = sheet[offset + y * 2] ?? 0;
    const d1 = sheet[offset + y * 2 + 1] ?? 0;
    const d2 = sheet[offset + 16 + y] ?? 0;
    for (let x = 0; x < 8; x += 1) {
      const bit = 7 - x;
      pixels[y * 8 + x] =
        ((d0 >>> bit) & 1) | (((d1 >>> bit) & 1) << 1) | (((d2 >>> bit) & 1) << 2);
    }
  }
  return pixels;
};

export { decodeBgTile };
