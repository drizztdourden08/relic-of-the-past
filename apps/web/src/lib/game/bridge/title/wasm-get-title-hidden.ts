/* @layer bridge-wasm @kind logic */
import { numberCall } from '../wasm-call';

const wasmGetTitleHidden = (): boolean => numberCall('WasmGetTitleHidden', 0) !== 0;

export { wasmGetTitleHidden };
