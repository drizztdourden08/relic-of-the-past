/* @layer bridge-wasm @kind logic */
/**
 * Native grant ids: what the game's own script passes to the plain receive
 * seam when a check's vanilla grant fires, per check kind. The npc-kind id
 * comes from the record itself; the boss prize always grants the ceremonial
 * heart (decomp: the arena pickup's receive call); world items resolve their
 * vanilla item record's receive id; a dungeon reward carries the id its own
 * boss script hands over (prize-receive-id.ts).
 */

import { getItem, vanillaPrizeGrantIdOfName } from '@shared/game/data';
import type { CheckRecord } from '@shared/game/data';

/** The native grant tables hold 76 entries; 0xFF marks "no item" in the records. */
const MAX_NATIVE_GRANT_ID = 75;

/** The ceremonial heart the boss arena pickup grants (decomp-audited receive id). */
const BOSS_PRIZE_GRANT_ID = 62;

const nativeGrantIdOf = (check: CheckRecord): number | undefined => {
  const { kind, gameId, vanillaItemIds } = check;
  if (kind === 'npc') {
    const { flagType, itemId } = gameId;
    if (flagType === undefined || itemId === undefined) return undefined;
    return itemId <= MAX_NATIVE_GRANT_ID ? itemId : undefined;
  }
  if (kind === 'boss') return BOSS_PRIZE_GRANT_ID;
  // A dungeon reward: the falling ancilla carries the id the boss's own script grants,
  // the dungeon's vanilla pendant, or the one shared crystal id. The record's vanilla item
  // names it; its own gameId cannot, because the crystal-category records carry none.
  if (kind === 'prize') {
    const vanillaItem = vanillaItemIds[0];
    if (vanillaItem === undefined) return undefined;
    return vanillaPrizeGrantIdOfName(getItem(vanillaItem).randomizerName);
  }
  if (kind === 'standing' || kind === 'dig' || kind === 'bonk') {
    const vanillaItem = vanillaItemIds[0];
    if (vanillaItem === undefined) return undefined;
    const receiveId = getItem(vanillaItem).gameId?.receiveItemId;
    if (receiveId === undefined || receiveId > MAX_NATIVE_GRANT_ID) return undefined;
    return receiveId;
  }
  return undefined;
};

export { nativeGrantIdOf };
