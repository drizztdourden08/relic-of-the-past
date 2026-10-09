/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimUnlockDoor = (roomId: number, doorIndex: number, consume: boolean): void =>
  voidCall('WasmSimUnlockDoor', { argTypes: ['number', 'number', 'number'], args: [roomId, doorIndex, consume ? 1 : 0] });

export { wasmSimUnlockDoor };
