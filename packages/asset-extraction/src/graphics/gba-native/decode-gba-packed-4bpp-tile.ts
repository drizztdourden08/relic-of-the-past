/* @layer shared-asset-extraction @kind logic */
import { GBA_4BPP_TILE_BYTES, TILE_PIXELS } from './gba-native.constants';

const decodeGbaPacked4bppTile = (data: Uint8Array, offset = 0): Uint8Array => {
  if (offset < 0 || offset + GBA_4BPP_TILE_BYTES > data.length) throw new Error('GBA tile offset is out of range');
  const pixels = new Uint8Array(TILE_PIXELS);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const packed = data[offset + y * 4 + (x >>> 1)] ?? 0;
      pixels[y * 8 + x] = x & 1 ? packed >>> 4 : packed & 0x0f;
    }
  }
  return pixels;
};

export { decodeGbaPacked4bppTile };
