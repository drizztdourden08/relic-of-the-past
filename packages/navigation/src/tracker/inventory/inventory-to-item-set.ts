/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import {
  addBits, addByValue, addLadder, addNative,
  BIG_KEY_BITS, BOTTLE_SLOT, BY_VALUE, CRYSTAL_BITS, LADDERS, MIRROR, PENDANT_BITS, SIMPLE,
} from '../item-ids';
import { TOP_FLUTE_VALUE, UPGRADED_MIRROR_VALUE } from './inventory.constants';
import { swordLevelOwned } from './sword-level-owned';
import type { RawInventoryState } from './inventory.type';

const bowRungs = (bow: number): number => {
  if (bow >= 3) return 2;
  return bow >= 1 ? 1 : 0;
};

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

  addLadder(items, LADDERS.sword, swordLevelOwned(raw));
  addLadder(items, LADDERS.shield, raw.shield);
  addLadder(items, LADDERS.mail, raw.armor);
  addLadder(items, LADDERS.lift, raw.gloves);
  addLadder(items, LADDERS.bow, bowRungs(raw.bow));

  addSimpleFlags(items, raw);
  if (raw.bombsEverHeld && raw.bombCapacity > 0) addNative(items, SIMPLE.bombs);
  if (raw.mirror >= UPGRADED_MIRROR_VALUE) addNative(items, MIRROR);

  addByValue(items, BY_VALUE.boomerang, raw.boomerang);
  addByValue(items, BY_VALUE.mushroom, raw.mushroom);
  addByValue(items, BY_VALUE.flute, Math.min(raw.flute, TOP_FLUTE_VALUE));

  addBottles(items, raw);
  addBits(items, PENDANT_BITS, raw.pendants);
  addBits(items, CRYSTAL_BITS, raw.crystals);
  addBits(items, BIG_KEY_BITS, raw.bigKeys);

  return items;
};

export { inventoryToItemSet };
