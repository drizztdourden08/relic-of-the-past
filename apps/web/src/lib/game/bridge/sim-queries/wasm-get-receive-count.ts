/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';

const wasmGetReceiveCount = (itemId: number): number =>
  callWhenRunning(0, (mod) => mod.ccall('WasmGetReceiveCount', 'number', ['number'], [itemId]) as number);

export { wasmGetReceiveCount };
