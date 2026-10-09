/* @layer bridge-wasm @kind logic */
import { readU8 } from '../wasm-call';
import { LOWER_LAYER_OFFSET, ROOM_TILES, STAIR_FILLER_ATTR } from './room-grids.constants';
import type { DualLayerGrids, GridCell } from './room-grids.type';

const decodeDualLayers = (heap: Uint8Array, ptr: number): DualLayerGrids | null => {
  const layer0: number[][] = [];
  const layer1: number[][] = [];
  const stairTiles: Array<GridCell> = [];
  let hasDifference = false;
  for (let r = 0; r < ROOM_TILES; r++) {
    const row0 = ptr + r * ROOM_TILES;
    const row1 = ptr + LOWER_LAYER_OFFSET + r * ROOM_TILES;
    const cells0 = new Array<number>(ROOM_TILES);
    const cells1 = new Array<number>(ROOM_TILES);
    for (let c = 0; c < ROOM_TILES; c++) {
      let a0 = readU8(heap, row0 + c);
      let a1 = readU8(heap, row1 + c);
      if (a1 === STAIR_FILLER_ATTR) {
        stairTiles.push({ row: r, col: c });
      }
      if (a0 === STAIR_FILLER_ATTR && a1 !== STAIR_FILLER_ATTR) a0 = a1;
      if (a1 === STAIR_FILLER_ATTR && a0 !== STAIR_FILLER_ATTR) a1 = a0;
      cells0[c] = a0;
      cells1[c] = a1;
      if (a0 !== a1) hasDifference = true;
    }
    layer0.push(cells0);
    layer1.push(cells1);
  }
  if (!hasDifference) return null;
  return { layer0, layer1, stairTiles };
};

export { decodeDualLayers };
