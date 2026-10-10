/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';

const wasmGetRoomCollisionType = (): number | null =>
  callWhenRunning<number | null>(null, (mod) => mod.ccall('WasmGetRoomCollisionType', 'number', [], []));

export { wasmGetRoomCollisionType };
