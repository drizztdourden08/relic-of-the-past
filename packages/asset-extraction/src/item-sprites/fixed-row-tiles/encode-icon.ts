/* @layer shared-asset-extraction @kind logic */
import { SLOT_BYTES, SLOT_SIDE, TILE_BYTES, TILE_ORIGINS } from './fixed-row-tiles.constants';

const encodeTile = (indices: Uint8Array, origin: readonly [number, number], out: Uint8Array, offset: number): void => {
  const [ox, oy] = origin;
  for (let y = 0; y < 8; y++) {
    const planes: [number, number, number, number] = [0, 0, 0, 0];
    for (let x = 0; x < 8; x++) {
      const index = indices[(oy + y) * SLOT_SIDE + ox + x] ?? 0;
      const bit = 7 - x;
      for (let p = 0; p < 4; p++) planes[p] = (planes[p] ?? 0) | (((index >> p) & 1) << bit);
    }
    out[offset + y * 2] = planes[0];
    out[offset + y * 2 + 1] = planes[1];
    out[offset + 16 + y * 2] = planes[2];
    out[offset + 17 + y * 2] = planes[3];
  }
};

const encodeIcon = (indices: Uint8Array): Uint8Array => {
  const out = new Uint8Array(SLOT_BYTES);
  TILE_ORIGINS.forEach((origin, tile) => encodeTile(indices, origin, out, tile * TILE_BYTES));
  return out;
};

export { encodeIcon };
