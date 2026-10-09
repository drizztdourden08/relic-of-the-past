/* @layer bridge-wasm @kind logic */
import { voidCall } from '../../bridge/wasm-call';
import { numArgs } from '../../num-args';
import type { BottleContentsValue, BottleSlot } from '../cheats.type';

const cheatSetBottle = (slot: BottleSlot, contents: BottleContentsValue): void =>
  voidCall('WasmCheatSetBottle', numArgs(slot, contents));

export { cheatSetBottle };
