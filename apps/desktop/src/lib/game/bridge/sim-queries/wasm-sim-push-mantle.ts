/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimPushMantle = (): void => voidCall('WasmSimPushMantle', { argTypes: [], args: [] });

export { wasmSimPushMantle };
