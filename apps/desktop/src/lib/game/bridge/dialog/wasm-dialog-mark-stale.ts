/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmDialogMarkStale = (): void => voidCall('WasmDialogMarkStale');

export { wasmDialogMarkStale };
