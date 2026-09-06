/* @layer shared-game @kind logic */
/**
 * Virtual receive ids for the progressive equipment families: the TS half of
 * the contract in core/game-hooks/progressive_grants.c. The pool carries N
 * copies of one "Progressive X" item per family, but the native receive
 * routine SETS a tier instead of incrementing it, so a copy resolved to a
 * fixed native id at session-arm time re-set the same tier on every grant.
 * The id space 0x62-0x66, ABOVE the upgrade range 0x50-0x61, is reserved so
 * a copy rides every override table and the receipt export unresolved; the
 * core maps it to the NEXT tier's native id from live inventory at the last
 * moment before the receive flow (past the top tier: the reference
 * randomizer's replacement, the twenty-rupee pickup).
 *
 *   0x62  Progressive Sword    0x63  Progressive Shield
 *   0x64  Progressive Glove    0x65  Progressive Mail
 *   0x66  Progressive Bow
 */

const PROGRESSIVE_VIRT_FIRST = 0x62;
const PROGRESSIVE_VIRT_LAST = 0x66;

/** Pool-item name → virtual receive id, mirroring the C encoding exactly. */
const PROGRESSIVE_RECEIVE_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
  ['Progressive Sword', 0x62],
  ['Progressive Shield', 0x63],
  ['Progressive Glove', 0x64],
  ['Progressive Mail', 0x65],
  ['Progressive Bow', 0x66],
]);

/** Dataset item id → virtual receive id (the records carry no gameId for these). */
const PROGRESSIVE_RECEIVE_ID_BY_ITEM: ReadonlyMap<string, number> = new Map([
  ['item-079', 0x62], // Progressive Sword
  ['item-080', 0x63], // Progressive Shield
  ['item-082', 0x64], // Progressive Glove
  ['item-081', 0x65], // Progressive Mail
  ['item-083', 0x66], // Progressive Bow
]);

const isProgressiveReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= PROGRESSIVE_VIRT_FIRST && id <= PROGRESSIVE_VIRT_LAST;

const progressiveReceiveIdOfName = (standardItemName: string): number | undefined =>
  PROGRESSIVE_RECEIVE_ID_BY_NAME.get(standardItemName);

const progressiveReceiveIdOfItem = (itemId: string): number | undefined =>
  PROGRESSIVE_RECEIVE_ID_BY_ITEM.get(itemId);

export { isProgressiveReceiveId, progressiveReceiveIdOfItem, progressiveReceiveIdOfName };
