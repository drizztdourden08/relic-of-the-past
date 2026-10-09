/* @layer bridge-wasm @kind logic */
import { voidCall } from '../wasm-call';

const wasmSimKillDrop = (roomId: number, itemId: number): void =>
  voidCall('WasmSimKillDrop', { argTypes: ['number', 'number'], args: [roomId, itemId] });

export { wasmSimKillDrop };
