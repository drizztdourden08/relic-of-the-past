/* @layer bridge-wasm @kind logic */
import { enqueueCheatGrant } from './enqueue-cheat-grant';
import type { NpcCheckGrant } from './cheat-trigger-npc-check.type';

const cheatTriggerNpcCheck = (grant: NpcCheckGrant): void => {
  const { flagType, flagMask, itemId, spriteType, postGfx } = grant;
  enqueueCheatGrant(itemId, { type: 'trigger_npc_check', flagType, flagMask, itemId, spriteType, postGfx });
};

export { cheatTriggerNpcCheck };
