/* @layer bridge-wasm @kind constants */
import type { ItemId } from '@rotp/game-data';

const LADDERS = {
  sword: [73, 1, 2, 3],
  shield: [4, 5, 6],
  mail: [34, 35],
  lift: [27, 28],
  bow: [11, 59],
} as const;

const BY_VALUE = {
  boomerang: { 1: 12, 2: 42 },
  mushroom: { 1: 41, 2: 13 },
  flute: { 1: 19, 2: 20, 3: 74 },
  bottle: { 2: 43, 3: 44, 4: 45, 5: 61, 6: 60, 7: 72 },
} as const;

const SIMPLE = {
  hookshot: 10,
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

const BOTTLE_SLOT = 22;
const MIRROR = 26;

const PENDANT_BITS: readonly (readonly [number, ItemId])[] = [
  [0x04, 'item-056'], [0x02, 'item-058'], [0x01, 'item-057'],
];
const CRYSTAL_BITS: readonly (readonly [number, ItemId])[] = [
  [0x02, 'item-112'], [0x10, 'item-113'], [0x40, 'item-114'], [0x20, 'item-115'],
  [0x04, 'item-116'], [0x01, 'item-117'], [0x08, 'item-118'],
];

const BIG_KEY_BITS: readonly (readonly [number, ItemId])[] = [
  [0x8000, 'item-095'], [0x4000, 'item-095'], [0x2000, 'item-094'], [0x1000, 'item-093'],
  [0x0400, 'item-092'], [0x0200, 'item-091'], [0x0100, 'item-090'], [0x0080, 'item-089'],
  [0x0040, 'item-088'], [0x0020, 'item-087'], [0x0010, 'item-086'], [0x0008, 'item-085'], [0x0004, 'item-084'],
];

export { LADDERS, BY_VALUE, SIMPLE, BOTTLE_SLOT, MIRROR, PENDANT_BITS, CRYSTAL_BITS, BIG_KEY_BITS };
