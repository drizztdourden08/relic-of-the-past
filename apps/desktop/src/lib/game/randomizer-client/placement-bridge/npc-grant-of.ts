/* @layer bridge-wasm @kind logic */
import { getCheck } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';
import type { PlanEntry } from '../physical-plan.type';

const npcGrantOf = (checkId: string): PlanEntry['npcGrant'] => {
  const { flagType, flagMask, spriteType, postGfx } = getCheck(checkId as CheckId).gameId;
  if (flagType === undefined || spriteType === undefined) return undefined;
  return { flagType, flagMask: flagMask ?? 0, spriteType, postGfx: postGfx ?? 0 };
};

export { npcGrantOf };
