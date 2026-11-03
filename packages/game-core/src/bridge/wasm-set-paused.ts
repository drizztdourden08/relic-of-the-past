/* @layer bridge-wasm @kind logic */
import { boolArg } from './bool-arg';
import { voidCall } from './wasm-call';

const wasmSetPaused = (paused: boolean): void => voidCall('WasmSetPaused', boolArg(paused));

export { wasmSetPaused };
