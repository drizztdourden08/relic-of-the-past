/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmHostMenuClose = (): void => voidCall('WasmHostMenuClose');

export { wasmHostMenuClose };
