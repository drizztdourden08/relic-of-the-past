/* @layer bridge-wasm @kind logic */
/**
 * The drop sprite a key drop spawns: the large one when the drop's vanilla item is its
 * dungeon's Big Key, the small one otherwise. The core matches a drop override on
 * (room, size), so an entry armed at the wrong size never fires and the vanilla key is
 * granted instead (drop_overrides.c).
 */
import { getCheck, getDungeon } from '@shared/game/data';
import type { CheckId } from '@shared/game/data';

const isBigKeyDrop = (checkId: CheckId): boolean => {
  const { dungeonId, vanillaItemIds } = getCheck(checkId);
  if (dungeonId === undefined) return false;
  const { bigKey } = getDungeon(dungeonId).items;
  return bigKey !== null && vanillaItemIds[0] === bigKey;
};

export { isBigKeyDrop };
