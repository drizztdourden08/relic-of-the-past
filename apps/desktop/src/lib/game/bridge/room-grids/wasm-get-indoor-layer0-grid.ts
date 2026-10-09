/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { ROOM_TILES } from './room-grids.constants';

const wasmGetIndoorLayer0Grid = (): number[][] | null =>
  callPtr('WasmGetIndoorAttrTable', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const grid: number[][] = Array.from({ length: ROOM_TILES }, () => new Array<number>(ROOM_TILES));
    for (let r = 0; r < ROOM_TILES; r++) {
      for (let c = 0; c < ROOM_TILES; c++) {
        grid[r][c] = heap[ptr + r * ROOM_TILES + c];
      }
    }
    return grid;
  });

export { wasmGetIndoorLayer0Grid };
