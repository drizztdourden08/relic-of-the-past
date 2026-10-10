/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';

const wasmGetLinkLayer = (): 0 | 1 | null =>
  callWhenRunning<0 | 1 | null>(null, (mod) => ((mod.ccall('WasmGetLinkIsOnLowerLevel', 'number', [], [])) !== 0 ? 1 : 0));

export { wasmGetLinkLayer };
