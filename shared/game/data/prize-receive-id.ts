/* @layer shared-game @kind logic */
/**
 * Receive ids for the ten dungeon prizes — the TS half of the contract in
 * core/game-hooks/prize_grants.c.
 *
 * The three pendants need nothing special: each has its own native receive id
 * and the native grant sets a FIXED bit for it, so a pendant is a normal item
 * wherever it is placed (0x37 green, 0x38 red, 0x39 blue).
 *
 * All seven crystals share one native id (0x20), and which crystal it banks
 * comes from the room the player is standing in, not from the id — so an
 * assigned crystal would bank whichever one the boss room names. The id space
 * 0x7B-0x81, ABOVE the progressive-capacity range that ends at 0x7A, is
 * reserved so a crystal rides every override table unresolved; the core banks
 * the named crystal's bit and hands the vanilla receive flow the native id at
 * the last moment before the receipt.
 *
 *   0x7B  Crystal 1    0x7C  Crystal 2    0x7D  Crystal 3    0x7E  Crystal 4
 *   0x7F  Crystal 5    0x80  Crystal 6    0x81  Crystal 7
 *
 * The dataset carries two records per pendant name (a junk-category one with
 * the native id and a crystal-category one without), so a name lookup over the
 * records alone is ambiguous — these tables are the single answer for a prize.
 */

const PRIZE_VIRT_FIRST = 0x7b;
const PRIZE_VIRT_LAST = 0x81;

/** Pool-item name → receive id, mirroring the C encoding exactly. */
const PRIZE_RECEIVE_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
  ['Green Pendant', 0x37],
  ['Red Pendant', 0x38],
  ['Blue Pendant', 0x39],
  ['Crystal 1', 0x7b],
  ['Crystal 2', 0x7c],
  ['Crystal 3', 0x7d],
  ['Crystal 4', 0x7e],
  ['Crystal 5', 0x7f],
  ['Crystal 6', 0x80],
  ['Crystal 7', 0x81],
]);

/** Dataset item id → receive id, for the crystal-category records that carry no gameId. */
const PRIZE_RECEIVE_ID_BY_ITEM: ReadonlyMap<string, number> = new Map([
  ['item-109', 0x37], // Green Pendant
  ['item-111', 0x38], // Red Pendant
  ['item-110', 0x39], // Blue Pendant
  ['item-112', 0x7b],
  ['item-113', 0x7c],
  ['item-114', 0x7d],
  ['item-115', 0x7e],
  ['item-116', 0x7f],
  ['item-117', 0x80],
  ['item-118', 0x81],
]);

/**
 * The NATIVE receive id a boss's own script hands over for this prize — what the falling
 * ancilla carries and therefore the key a substitution table matches on. All seven
 * crystals share one id (0x20); the pendants keep their own.
 */
const VANILLA_PRIZE_GRANT_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
  ['Green Pendant', 0x37],
  ['Red Pendant', 0x38],
  ['Blue Pendant', 0x39],
  ['Crystal 1', 0x20],
  ['Crystal 2', 0x20],
  ['Crystal 3', 0x20],
  ['Crystal 4', 0x20],
  ['Crystal 5', 0x20],
  ['Crystal 6', 0x20],
  ['Crystal 7', 0x20],
]);

const vanillaPrizeGrantIdOfName = (standardItemName: string): number | undefined =>
  VANILLA_PRIZE_GRANT_ID_BY_NAME.get(standardItemName);

/** True for a virtual CRYSTAL id; the pendants resolve to native ids and are not virtual. */
const isPrizeReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= PRIZE_VIRT_FIRST && id <= PRIZE_VIRT_LAST;

const prizeReceiveIdOfName = (standardItemName: string): number | undefined =>
  PRIZE_RECEIVE_ID_BY_NAME.get(standardItemName);

const prizeReceiveIdOfItem = (itemId: string): number | undefined =>
  PRIZE_RECEIVE_ID_BY_ITEM.get(itemId);

export { isPrizeReceiveId, prizeReceiveIdOfItem, prizeReceiveIdOfName, vanillaPrizeGrantIdOfName };
