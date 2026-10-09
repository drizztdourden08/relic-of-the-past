/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmHostMenuSaveAndQuit = (): void => voidCall('WasmHostMenuSaveAndQuit');

export { wasmHostMenuSaveAndQuit };
