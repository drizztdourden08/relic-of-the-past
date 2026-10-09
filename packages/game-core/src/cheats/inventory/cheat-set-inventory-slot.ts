/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';

const cheatSetInventorySlot = (slot: number, value: number): void =>
  voidCall('WasmCheatSetInventorySlot', numArgs(slot, value));

export { cheatSetInventorySlot };
