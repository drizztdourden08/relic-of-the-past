/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { readU16Table } from './read-u16-table';
import { REPLACEMENT_TILE_SLOTS } from './room-grids.constants';

const wasmGetReplacementTileState = (): number[] | null =>
  callPtr('WasmGetReplacementTileState', (mod, ptr) => readU16Table(mod.HEAPU8, ptr, REPLACEMENT_TILE_SLOTS));

export { wasmGetReplacementTileState };
