/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';

const wasmGetReceiveSite = (site: number): number =>
  callWhenRunning(0, (mod) => mod.ccall('WasmGetReceiveSite', 'number', ['number'], [site]) as number);

export { wasmGetReceiveSite };
