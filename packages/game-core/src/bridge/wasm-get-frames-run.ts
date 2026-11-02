/* @layer bridge-wasm @kind logic */
import { numberCall } from './wasm-call';

const wasmGetFramesRun = (): number => numberCall('WasmGetFramesRun', 0);

export { wasmGetFramesRun };
