/* @layer shared-game @kind logic */
/**
 * Receive ids for the ten dungeon prizes: the TS half of the contract in
 * core/game-hooks/prize_grants.c.
 *
 * The three pendants need nothing special: each has its own native receive id
 * and the native grant sets a FIXED bit for it, so a pendant is a normal item
 * wherever it is placed (0x37 green, 0x38 red, 0x39 blue).
 *
 * All seven crystals share one native id (0x20), and which crystal it banks
 * comes from the room the player is standing in, not from the id, so an
 * assigned crystal would bank whichever one the boss room names. The id space
 * 0x7B-0x81, ABOVE the progressive-capacity range that ends at 0x7A, is
 * reserved so a crystal rides every override table unresolved; the core banks
 * the named crystal's bit and hands the vanilla receive flow the native id at
 * the last moment before the receipt.
 *
 *   0x7B  Crystal 1    0x7C  Crystal 2    0x7D  Crystal 3    0x7E  Crystal 4
 *   0x7F  Crystal 5    0x80  Crystal 6    0x81  Crystal 7
 *
 * Every item name is unique across the records, so a pendant resolves off its own
 * record and no table here names one. What stays is the crystal id space, which no
 * record field can hold: it is a reservation in the core's id range, not a game value.
 */

const PRIZE_VIRT_FIRST = 0x7b;
const PRIZE_VIRT_LAST = 0x81;

/**
 * Crystal name → reserved receive id, mirroring the C encoding exactly. The pendants are
 * absent on purpose: each one's own record carries its native id, so it resolves there.
 * A name lookup cannot be dropped here, because no record field holds a reserved id.
 */
const PRIZE_RECEIVE_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
  ['Crystal 1', 0x7b],
  ['Crystal 2', 0x7c],
  ['Crystal 3', 0x7d],
  ['Crystal 4', 0x7e],
  ['Crystal 5', 0x7f],
  ['Crystal 6', 0x80],
  ['Crystal 7', 0x81],
]);

/**
 * The NATIVE receive id a boss's own script hands over for this prize: what the falling
 * ancilla carries and therefore the key a substitution table matches on. All seven
 * crystals share one id (0x20), which is the only reason this table exists; a pendant's
 * own record already says which id its boss hands over.
 */
const VANILLA_PRIZE_GRANT_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
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

export { isPrizeReceiveId, prizeReceiveIdOfName, vanillaPrizeGrantIdOfName };
