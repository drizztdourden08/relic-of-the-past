/* @layer bridge-wasm @kind logic */
import { getItem } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';
import { cheatTriggerCheck } from '../cheats/grants/cheat-trigger-check';
import { cheatTriggerNpcCheck } from '../cheats/grants/cheat-trigger-npc-check';
import { FALLBACK_VANILLA_ID } from './cheat-check-grant.constants';

const vanillaReceiveIdOf = (check: CheckRecord): number => {
  const itemId = check.vanillaItemIds[0];
  return itemId ? getItem(itemId).gameId?.receiveItemId ?? FALLBACK_VANILLA_ID : FALLBACK_VANILLA_ID;
};

const grantVanilla = (check: CheckRecord): void => {
  const { roomId, chestIndex, flagType, flagMask, itemId, spriteType, postGfx } = check.gameId;
  if (check.kind === 'npc') {
    if (flagType !== undefined && flagMask !== undefined && itemId !== undefined
      && spriteType !== undefined && postGfx !== undefined) {
      cheatTriggerNpcCheck({ flagType, flagMask, itemId, spriteType, postGfx });
    }
    return;
  }
  if (roomId !== undefined && chestIndex !== undefined) {
    cheatTriggerCheck(roomId, chestIndex, vanillaReceiveIdOf(check));
  }
};

export { grantVanilla };
