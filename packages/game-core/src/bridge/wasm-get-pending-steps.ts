/* @layer bridge-wasm @kind logic */
import { numberCall } from './wasm-call';

const wasmGetPendingSteps = (): number => numberCall('WasmGetPendingSteps', 0);

export { wasmGetPendingSteps };
