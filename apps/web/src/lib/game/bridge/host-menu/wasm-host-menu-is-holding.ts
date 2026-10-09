/* @layer bridge-wasm @kind logic */
import { numberCall } from '../wasm-call';

const wasmHostMenuIsHolding = (): boolean => numberCall('WasmHostMenuIsHolding', 0) !== 0;

export { wasmHostMenuIsHolding };
