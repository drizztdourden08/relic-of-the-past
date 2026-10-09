/* @layer bridge-wasm @kind logic */
import { numberCall } from '../wasm-call';

const wasmGetUIOverlayMode = (): number => numberCall('WasmGetUIOverlayMode', 0);

export { wasmGetUIOverlayMode };
