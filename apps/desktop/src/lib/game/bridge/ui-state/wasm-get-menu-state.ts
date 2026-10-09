/* @layer bridge-wasm @kind logic */
import { numberCall } from '../wasm-call';

const wasmGetMenuState = (): number => numberCall('WasmGetMenuState', 0);

export { wasmGetMenuState };
