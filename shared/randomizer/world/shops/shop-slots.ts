/* @layer shared-game @kind logic */
/**
 * Shop slots as randomizer locations.
 *
 * A slot opens as a location only when the profile asks for it. WHICH slots
 * open is the scope's business (shop-scope.ts): the player ticks the slots
 * that may be shuffled, and the mode decides how many of them the seed takes.
 * A scope that opens nothing leaves the world exactly as it is.
 *
 * DEPTH. The depth option multiplies each opened slot: at depth N the slot
 * restocks N times, so it carries N locations bought in a fixed order, keyed
 * `<shop>-shelf_<side>-slot_<n>` (location-key.ts). Only the first is a spot
 * the unmodified game has, so only the first maps back to a check record.
 */
import { CANONICAL_SLOTS } from './shop-slot-facts';
import { openedSlotIndicesOf } from './shop-scope';
import { shopSlotLocationKey } from './shop-location-keys';
import type { CheckId, RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key';
import type { ShopSlotFacts } from './shop-slot-facts';
import type { ShopScope } from './shop-scope.type';

/** How many purchases one slot can carry, the first plus four restocks. */
const MAX_SHOP_SLOT_DEPTH = 5;

const MIN_SHOP_SLOT_DEPTH = 1;

interface ShopSlotLocation {
  slot: ShopSlotFacts;
  key: LocationKey;
  /** 0-based purchase order within the slot; 0 is the first sale. */
  depthIndex: number;
}

const keyOf = (slot: ShopSlotFacts, depthIndex: number): LocationKey => shopSlotLocationKey(slot, depthIndex);

const clampDepth = (depth: number): number =>
  Math.min(MAX_SHOP_SLOT_DEPTH, Math.max(MIN_SHOP_SLOT_DEPTH, Math.trunc(depth)));

/** The locations this scope opens, in canonical slot order then purchase order. */
const shopSlotLocationsOf = (scope: ShopScope): readonly ShopSlotLocation[] => {
  const depth = clampDepth(scope.depth);
  const rows: ShopSlotLocation[] = [];
  for (const canonicalIndex of openedSlotIndicesOf(scope)) {
    const slot = CANONICAL_SLOTS[canonicalIndex];
    for (let depthIndex = 0; depthIndex < depth; depthIndex += 1) {
      rows.push({ slot, key: keyOf(slot, depthIndex), depthIndex });
    }
  }
  return rows;
};

/** Every key a shop slot could ever take, at any depth: the membership set. */
const ALL_SHOP_SLOT_LOCATIONS: ReadonlyMap<LocationKey, ShopSlotLocation> = new Map(
  CANONICAL_SLOTS.flatMap((slot) =>
    Array.from({ length: MAX_SHOP_SLOT_DEPTH }, (_unused, depthIndex): [LocationKey, ShopSlotLocation] => [
      keyOf(slot, depthIndex),
      { slot, key: keyOf(slot, depthIndex), depthIndex },
    ])),
);

const isShopSlotLocation = (key: string): boolean => ALL_SHOP_SLOT_LOCATIONS.has(key as LocationKey);

const shopSlotLocationOf = (key: string): ShopSlotLocation | undefined =>
  ALL_SHOP_SLOT_LOCATIONS.get(key as LocationKey);

/** A shelf's check record to its first stock: the one purchase the record stands for. */
const FIRST_STOCK_BY_CHECK: ReadonlyMap<string, LocationKey> = new Map(
  CANONICAL_SLOTS.map((slot): [CheckId, LocationKey] => [slot.checkId, keyOf(slot, 0)]),
);

const shopLocationOfCheck = (checkId: string): LocationKey | undefined => FIRST_STOCK_BY_CHECK.get(checkId);

/** Purchase |purchase| (1 is the first stock) of the shelf a check record stands for. */
const shopPurchaseKeyOfCheck = (checkId: string, purchase: number): LocationKey | undefined => {
  const slot = CANONICAL_SLOTS.find((row) => row.checkId === checkId);
  return slot === undefined ? undefined : keyOf(slot, purchase - 1);
};

/** Locations this scope opens, grouped by the region they hang off. */
const shopLocationsByRegion = (scope: ShopScope): ReadonlyMap<RegionId, readonly LocationKey[]> => {
  const byRegion = new Map<RegionId, LocationKey[]>();
  for (const row of shopSlotLocationsOf(scope)) {
    const keys = byRegion.get(row.slot.region) ?? [];
    keys.push(row.key);
    byRegion.set(row.slot.region, keys);
  }
  return byRegion;
};

export {
  ALL_SHOP_SLOT_LOCATIONS,
  MAX_SHOP_SLOT_DEPTH,
  MIN_SHOP_SLOT_DEPTH,
  clampDepth,
  isShopSlotLocation,
  shopLocationOfCheck,
  shopLocationsByRegion,
  shopPurchaseKeyOfCheck,
  shopSlotLocationOf,
  shopSlotLocationsOf,
};
export type { ShopSlotLocation };
