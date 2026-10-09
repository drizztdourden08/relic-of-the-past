/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimFollowerRescue = (): void => voidCall('WasmSimFollowerRescue', { argTypes: [], args: [] });

export { wasmSimFollowerRescue };
