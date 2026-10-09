/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimOpenCellLock = (roomId: number, slot: number): void =>
  voidCall('WasmSimOpenCellLock', { argTypes: ['number', 'number'], args: [roomId, slot] });

export { wasmSimOpenCellLock };
