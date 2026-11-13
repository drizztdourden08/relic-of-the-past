/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSetExtendedAspect = (cols: number, rows: number): void =>
  voidCall('WasmSetExtendedAspect', { argTypes: ['number', 'number'], args: [cols, rows] });

export { wasmSetExtendedAspect };
