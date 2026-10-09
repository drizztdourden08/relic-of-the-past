/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimFollowerAttach = (): void => voidCall('WasmSimFollowerAttach', { argTypes: [], args: [] });

export { wasmSimFollowerAttach };
