/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmHostSetGear = (kind: number, tier: number): void =>
  voidCall('WasmHostSetGear', { argTypes: ['number', 'number'], args: [kind, tier] });

export { wasmHostSetGear };
