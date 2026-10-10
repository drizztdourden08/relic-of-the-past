/* @layer shared-asset-extraction @kind logic */
import { SLOT_SIDE } from './fixed-row-tiles.constants';

const shiftIndicesLeft = (indices: Uint8Array, dx: number): Uint8Array => {
  const out = new Uint8Array(indices.length);
  for (let y = 0; y < SLOT_SIDE; y++) {
    for (let x = 0; x + dx < SLOT_SIDE; x++) out[y * SLOT_SIDE + x] = indices[y * SLOT_SIDE + x + dx] ?? 0;
  }
  return out;
};

export { shiftIndicesLeft };
