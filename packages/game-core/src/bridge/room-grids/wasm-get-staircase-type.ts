/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';

const wasmGetStaircaseType = (): number | null =>
  callWhenRunning<number | null>(null, (mod) => mod.ccall('WasmGetStaircaseType', 'number', [], []));

export { wasmGetStaircaseType };
