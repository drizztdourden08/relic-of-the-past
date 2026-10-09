/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimMarkMapIcons = (): void => voidCall('WasmSimMarkMapIcons', { argTypes: [], args: [] });

export { wasmSimMarkMapIcons };
