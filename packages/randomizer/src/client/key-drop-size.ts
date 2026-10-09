/* @layer bridge-wasm @kind logic */
import { getCheck, getDungeon } from '@rotp/game-data';
import type { CheckId } from '@rotp/game-data';

const isBigKeyDrop = (checkId: CheckId): boolean => {
  const { dungeonId, vanillaItemIds } = getCheck(checkId);
  if (dungeonId === undefined) return false;
  const { bigKey } = getDungeon(dungeonId).items;
  return bigKey !== null && vanillaItemIds[0] === bigKey;
};

export { isBigKeyDrop };
