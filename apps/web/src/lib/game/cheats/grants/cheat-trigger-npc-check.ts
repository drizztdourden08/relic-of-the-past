/* @layer bridge-wasm @kind logic */
import { enqueueCheatGrant } from './enqueue-cheat-grant';

const cheatTriggerNpcCheck = (flagType: number, flagMask: number, itemId: number, spriteType: number, postGfx: number): void =>
  enqueueCheatGrant(itemId, { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx });

export { cheatTriggerNpcCheck };
