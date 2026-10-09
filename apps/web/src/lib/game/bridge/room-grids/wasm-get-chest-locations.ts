/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { readU16Table } from './read-u16-table';
import { CHEST_LOCK_SLOTS } from './room-grids.constants';

const wasmGetChestLocations = (): number[] | null =>
  callPtr('WasmGetChestLocations', (mod, ptr) => readU16Table(mod.HEAPU8, ptr, CHEST_LOCK_SLOTS));

export { wasmGetChestLocations };
