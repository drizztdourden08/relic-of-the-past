/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmHostSetActiveItem = (hudItem: number): void =>
  voidCall('WasmHostSetActiveItem', { argTypes: ['number'], args: [hudItem] });

export { wasmHostSetActiveItem };
