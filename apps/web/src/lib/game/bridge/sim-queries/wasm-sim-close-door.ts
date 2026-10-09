/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimCloseDoor = (roomId: number, doorIndex: number): void =>
  voidCall('WasmSimCloseDoor', { argTypes: ['number', 'number'], args: [roomId, doorIndex] });

export { wasmSimCloseDoor };
