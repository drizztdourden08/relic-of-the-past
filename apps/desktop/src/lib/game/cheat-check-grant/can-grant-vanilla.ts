/* @layer bridge-wasm @kind logic */
import type { CheckRecord } from '@shared/game/data';

const canGrantVanilla = (check: CheckRecord): boolean => {
  const { roomId, chestIndex, flagType, flagMask, itemId, spriteType, postGfx } = check.gameId;
  if (check.kind === 'npc') {
    return flagType !== undefined && flagMask !== undefined && itemId !== undefined
      && spriteType !== undefined && postGfx !== undefined;
  }
  return roomId !== undefined && chestIndex !== undefined;
};

export { canGrantVanilla };
