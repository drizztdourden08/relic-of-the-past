/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmHostMenuSetTakeover = (on: boolean): void =>
  voidCall('WasmHostMenuSetTakeover', { argTypes: ['number'], args: [on ? 1 : 0] });

export { wasmHostMenuSetTakeover };
