/* @layer bridge-wasm @kind logic */
/**
 * Raw inventory slot values → dataset `ItemId`s.
 *
 * The tracker reads bytes out of WRAM; every one of them is answered with an id,
 * never a display name. Two sources, and nothing else:
 *   - the game's own `Link_ReceiveItem` index, resolved through the facade, so
 *     the dataset owns the join and a renamed record cannot break the tracker;
 *   - an explicit id constant for the handful of items that HAVE no receive
 *     index, because they are SRAM bits rather than pickups (pendants, crystals).
 *
 * Resolution is deliberately lazy (per poll, not at module load): a published
 * dataset bundle can replace the records after import, and a snapshot taken at
 * import time would pin the pre-bundle ids.
 */
import { getItemByGameId } from '@shared/game/data';
import type { ItemId } from '@shared/game/data';

/** The dataset id for a native receive-item index. */
const idOf = (receiveItemId: number): ItemId | undefined => getItemByGameId({ receiveItemId })?.id;

/**
 * Progression ladders as native receive indices, weakest rung first. The raw
 * slot byte counts how many rungs are held, and every rung below it is held too
 * — a top-tier sword still answers "do you have a sword at all".
 */
const LADDERS = {
  sword: [73, 1, 2, 3],
  shield: [4, 5, 6],
  mail: [34, 35],
  lift: [27, 28],
  /** Slot values 1-2 are the plain bow, 3+ adds the silver one on top. */
  bow: [11, 59],
} as const;

/**
 * Slots where the raw byte SELECTS one item instead of climbing a ladder, as
 * `value → native receive index`.
 */
const BY_VALUE = {
  boomerang: { 1: 12, 2: 42 },
  mushroom: { 1: 41, 2: 13 },
  flute: { 1: 19, 2: 20, 3: 74 },
  /** A bottle slot's contents; the slot being non-empty is handled separately. */
  bottle: { 2: 43, 3: 44, 4: 45, 5: 61, 6: 60, 7: 72 },
} as const;

/** Slots that are a plain held / not-held byte, as `native receive index`. */
const SIMPLE = {
  hookshot: 10,
  /**
   * No record expresses bomb CAPACITY — the dataset only has the pickups — so
   * the standard bomb pickup stands in for "carries bombs". See the id-purity
   * report: this is the same gap that leaves `ITEM_TO_TOKEN`'s bomb key
   * matching no record.
   */
  bombs: 40,
  fireRod: 7,
  iceRod: 8,
  bombos: 15,
  ether: 16,
  quake: 17,
  lamp: 18,
  hammer: 9,
  bugNet: 33,
  book: 29,
  somaria: 21,
  byrna: 24,
  cape: 25,
  boots: 75,
  flippers: 30,
  moonPearl: 31,
} as const;

/** An empty bottle, whatever the slot holds. */
const BOTTLE_SLOT = 22;
/** Held at slot value 2 — value 1 is the un-upgraded mirror scroll. */
const MIRROR = 26;

/**
 * SRAM bit → id for the items with no receive index at all. These are the
 * progression pendants and crystals, which the game records as bits in a single
 * byte rather than granting through `Link_ReceiveItem`, so the facade has no
 * native fact to resolve them by and the id is stated outright.
 *
 * The pendants point at `item-056/057/058`, which is the trio the `Pendants`
 * item group (`ITEM_GROUP_IDS.Pendants`) names, and the sage's own
 * `presence`/`requirements` name. The dataset also holds
 * `item-109/110/111` — a second record per pendant, same display name — and this
 * used to grant those instead. Nothing noticed while the consumers compared names,
 * because both spell "Green Pendant"; the moment the inventory became a set of ids
 * the sage's condition stopped matching what the tracker granted.
 */
const PENDANT_BITS: readonly (readonly [number, ItemId])[] = [
  [0x04, 'item-056'], [0x02, 'item-057'], [0x01, 'item-058'],
];
const CRYSTAL_BITS: readonly (readonly [number, ItemId])[] = [
  [0x02, 'item-112'], [0x10, 'item-113'], [0x40, 'item-114'], [0x20, 'item-115'],
  [0x04, 'item-116'], [0x01, 'item-117'], [0x08, 'item-118'],
];

const addNative = (out: Set<ItemId>, receiveItemId: number): void => {
  const id = idOf(receiveItemId);
  if (id) out.add(id);
};

/** Every rung up to `held`, so a tier byte yields its whole progression. */
const addLadder = (out: Set<ItemId>, ladder: readonly number[], held: number): void => {
  for (let rung = 0; rung < held && rung < ladder.length; rung++) addNative(out, ladder[rung]);
};

const addByValue = (out: Set<ItemId>, table: Readonly<Record<number, number>>, value: number): void => {
  const receiveItemId = table[value];
  if (receiveItemId !== undefined) addNative(out, receiveItemId);
};

const addBits = (out: Set<ItemId>, bits: readonly (readonly [number, ItemId])[], byte: number): void => {
  for (const [bit, id] of bits) if (byte & bit) out.add(id);
};

export { addBits, addByValue, addLadder, addNative, idOf };
export { BOTTLE_SLOT, BY_VALUE, CRYSTAL_BITS, LADDERS, MIRROR, PENDANT_BITS, SIMPLE };
