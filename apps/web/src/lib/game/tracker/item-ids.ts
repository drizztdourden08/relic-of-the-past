/* @layer bridge-wasm @kind logic */
/**
 * Raw inventory slot values -> dataset `ItemId`s, never display names. Two sources only: the
 * game's `Link_ReceiveItem` index resolved through the facade (the dataset owns the join), and
 * an explicit id for items with no receive index (pendants, crystals: SRAM bits, not pickups).
 * Resolution is lazy (per poll) because a published dataset bundle can replace the records.
 */
import { getItemByGameId } from '@shared/game/data';
import type { ItemId } from '@shared/game/data';

/** The dataset id for a native receive-item index. */
const idOf = (receiveItemId: number): ItemId | undefined => getItemByGameId({ receiveItemId })?.id;

/**
 * Progression ladders as native receive indices, weakest rung first. The raw slot byte counts
 * rungs held, and every rung below is held too (a top-tier sword still answers "any sword").
 */
const LADDERS = {
  sword: [73, 1, 2, 3],
  shield: [4, 5, 6],
  mail: [34, 35],
  lift: [27, 28],
  /** Slot values 1-2 are the plain bow, 3+ adds the silver one on top. */
  bow: [11, 59],
} as const;

/** Slots where the raw byte SELECTS one item instead of climbing a ladder: `value -> native receive index`. */
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
  // No record expresses bomb CAPACITY (the dataset only has pickups), so the standard bomb
  // pickup stands in for "carries bombs". Same gap leaves `ITEM_TO_TOKEN`'s bomb key unmatched.
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
/** Held at slot value 2. Value 1 is the un-upgraded mirror scroll. */
const MIRROR = 26;

/**
 * SRAM bit -> id for the items with no receive index (pendants, crystals: bits in one byte,
 * never granted through `Link_ReceiveItem`). The pendants must point at `item-056/057/058`,
 * the trio the `Pendants` group and the sage's `presence`/`requirements` name; the dataset
 * also holds `item-109/110/111` (same display names), and granting those broke the sage's
 * condition once inventory became a set of ids.
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
