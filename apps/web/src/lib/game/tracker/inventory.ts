/* @layer bridge-wasm @kind logic */
/**
 * Inventory state parsing — reads the 34-byte WASM buffer from
 * WasmGetInventoryState() and converts it into a `Set<ItemId>`.
 *
 * The set is keyed by dataset id, never by display name. Names are not unique
 * (two records share several of them), so a name-keyed owned-set loses records
 * by construction; ids also mean the compiler rejects a display string being
 * mistaken for an owned item. The slot → id mapping itself lives in item-ids.ts.
 */
import type { ItemId } from '@shared/game/data';
import {
  addBits, addByValue, addLadder, addNative,
  BOTTLE_SLOT, BY_VALUE, CRYSTAL_BITS, LADDERS, MIRROR, PENDANT_BITS, SIMPLE,
} from './item-ids';

interface RawInventoryState {
  bow: number;
  boomerang: number;
  hookshot: number;
  bombs: number;
  mushroom: number;
  fireRod: number;
  iceRod: number;
  bombos: number;
  ether: number;
  quake: number;
  lamp: number;
  hammer: number;
  flute: number;
  bugNet: number;
  book: number;
  somaria: number;
  byrna: number;
  cape: number;
  mirror: number;
  gloves: number;
  boots: number;
  flippers: number;
  moonPearl: number;
  sword: number;
  shield: number;
  armor: number;
  bottle1: number;
  bottle2: number;
  bottle3: number;
  bottle4: number;
  pendants: number;
  crystals: number;
  heartPieces: number;
  healthCapacity: number;
}

const parseInventoryBuffer = (heapU8: Uint8Array, ptr: number): RawInventoryState => {
  return {
    bow: heapU8[ptr],
    boomerang: heapU8[ptr + 1],
    hookshot: heapU8[ptr + 2],
    bombs: heapU8[ptr + 3],
    mushroom: heapU8[ptr + 4],
    fireRod: heapU8[ptr + 5],
    iceRod: heapU8[ptr + 6],
    bombos: heapU8[ptr + 7],
    ether: heapU8[ptr + 8],
    quake: heapU8[ptr + 9],
    lamp: heapU8[ptr + 10],
    hammer: heapU8[ptr + 11],
    flute: heapU8[ptr + 12],
    bugNet: heapU8[ptr + 13],
    book: heapU8[ptr + 14],
    somaria: heapU8[ptr + 15],
    byrna: heapU8[ptr + 16],
    cape: heapU8[ptr + 17],
    mirror: heapU8[ptr + 18],
    gloves: heapU8[ptr + 19],
    boots: heapU8[ptr + 20],
    flippers: heapU8[ptr + 21],
    moonPearl: heapU8[ptr + 22],
    sword: heapU8[ptr + 23],
    shield: heapU8[ptr + 24],
    armor: heapU8[ptr + 25],
    bottle1: heapU8[ptr + 26],
    bottle2: heapU8[ptr + 27],
    bottle3: heapU8[ptr + 28],
    bottle4: heapU8[ptr + 29],
    pendants: heapU8[ptr + 30],
    crystals: heapU8[ptr + 31],
    heartPieces: heapU8[ptr + 32],
    healthCapacity: heapU8[ptr + 33],
  };
};

/** Slot values 1-2 are one rung, 3+ is two — the byte is not a rung count here. */
const bowRungs = (bow: number): number => (bow >= 3 ? 2 : bow >= 1 ? 1 : 0);

const addBottles = (items: Set<ItemId>, raw: RawInventoryState): void => {
  for (const slot of [raw.bottle1, raw.bottle2, raw.bottle3, raw.bottle4]) {
    if (slot <= 0) continue;
    addNative(items, BOTTLE_SLOT);
    addByValue(items, BY_VALUE.bottle, slot);
  }
};

const addSimpleFlags = (items: Set<ItemId>, raw: RawInventoryState): void => {
  for (const [slot, receiveItemId] of Object.entries(SIMPLE)) {
    if (raw[slot as keyof typeof SIMPLE]) addNative(items, receiveItemId);
  }
};

const inventoryToItemSet = (raw: RawInventoryState): Set<ItemId> => {
  const items = new Set<ItemId>();

  addLadder(items, LADDERS.sword, raw.sword);
  addLadder(items, LADDERS.shield, raw.shield);
  addLadder(items, LADDERS.mail, raw.armor);
  addLadder(items, LADDERS.lift, raw.gloves);
  addLadder(items, LADDERS.bow, bowRungs(raw.bow));

  addSimpleFlags(items, raw);
  if (raw.mirror >= 2) addNative(items, MIRROR);

  addByValue(items, BY_VALUE.boomerang, raw.boomerang);
  addByValue(items, BY_VALUE.mushroom, raw.mushroom);
  // The top flute value replaces the plain one rather than stacking on it.
  addByValue(items, BY_VALUE.flute, Math.min(raw.flute, 3));

  addBottles(items, raw);
  addBits(items, PENDANT_BITS, raw.pendants);
  addBits(items, CRYSTAL_BITS, raw.crystals);

  return items;
};

const setsEqual = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
};

export { inventoryToItemSet, parseInventoryBuffer, setsEqual };
export type { RawInventoryState };
