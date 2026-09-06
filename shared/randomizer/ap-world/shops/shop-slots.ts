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
 * restocks N times, so it carries N locations bought in a fixed order. The
 * first keeps the reference's own name — at depth 1 the whole naming is
 * byte-for-byte the community standard — and each restock appends an
 * ordinal, e.g. "Kakariko Shop Left (2nd)". The reference has no convention
 * for a repeated slot (it has no repeats), so this suffix is ours.
 *
 * A single-slot shop (the bomb counter) has no shelf position to name, so its
 * location is the shop's own name.
 */
import { SHOP_DEFS } from './shops.data';
import { openedSlotIndicesOf } from './shop-scope';
import type { ShopDef, ShopSlotDef } from './shops.data';
import type { ShopScope } from './shop-scope.type';

/** Depth ordinals past the first; the first purchase keeps the plain name. */
const RESTOCK_ORDINALS: readonly string[] = ['2nd', '3rd', '4th', '5th'];

const MIN_SHOP_SLOT_DEPTH = 1;
const MAX_SHOP_SLOT_DEPTH = RESTOCK_ORDINALS.length + 1;

interface CanonicalShopSlot {
  shop: ShopDef;
  slot: ShopSlotDef;
  /** 0-based position within its own shop, the order the game spawns its sprites. */
  slotIndex: number;
  /** 0-based index across every shop — the slot's stable id and its sold counter. */
  canonicalIndex: number;
}

interface ShopSlotLocation extends CanonicalShopSlot {
  name: string;
  /** 0-based purchase order within the slot; 0 is the first sale. */
  depthIndex: number;
}

const nameOf = (shop: ShopDef, slot: ShopSlotDef, depthIndex: number): string => {
  const base = slot.position === 'Single' ? shop.name : `${shop.name} ${slot.position}`;
  return depthIndex === 0 ? base : `${base} (${RESTOCK_ORDINALS[depthIndex - 1]})`;
};

/**
 * Every canonical slot, in canonical order — the list every mode draws from.
 * Built by walking the shops rather than by looking a slot up: four shops
 * share one inventory array, so a slot object cannot say which shop it is in.
 */
const CANONICAL_SLOTS: readonly CanonicalShopSlot[] = SHOP_DEFS.flatMap((shop, shopIndex) =>
  shop.slots.map((slot, slotIndex) => ({
    shop,
    slot,
    slotIndex,
    canonicalIndex: SHOP_DEFS.slice(0, shopIndex).reduce((sum, def) => sum + def.slots.length, 0) + slotIndex,
  })));

const clampDepth = (depth: number): number =>
  Math.min(MAX_SHOP_SLOT_DEPTH, Math.max(MIN_SHOP_SLOT_DEPTH, Math.trunc(depth)));

/** The locations this scope opens, in canonical slot order then purchase order. */
const shopSlotLocationsOf = (scope: ShopScope): readonly ShopSlotLocation[] => {
  const depth = clampDepth(scope.depth);
  const rows: ShopSlotLocation[] = [];
  for (const canonicalIndex of openedSlotIndicesOf(scope)) {
    const canonical = CANONICAL_SLOTS[canonicalIndex];
    for (let depthIndex = 0; depthIndex < depth; depthIndex += 1) {
      rows.push({ ...canonical, name: nameOf(canonical.shop, canonical.slot, depthIndex), depthIndex });
    }
  }
  return rows;
};

/** Every name a shop slot could ever take, at any depth — the membership set. */
const ALL_SHOP_SLOT_LOCATIONS: ReadonlyMap<string, ShopSlotLocation> = new Map(
  CANONICAL_SLOTS.flatMap((canonical) =>
    Array.from({ length: MAX_SHOP_SLOT_DEPTH }, (_unused, depthIndex): [string, ShopSlotLocation] => [
      nameOf(canonical.shop, canonical.slot, depthIndex),
      { ...canonical, name: nameOf(canonical.shop, canonical.slot, depthIndex), depthIndex },
    ])),
);

const isShopSlotLocation = (name: string): boolean => ALL_SHOP_SLOT_LOCATIONS.has(name);

const shopSlotLocationOf = (name: string): ShopSlotLocation | undefined =>
  ALL_SHOP_SLOT_LOCATIONS.get(name);

/** Locations this scope opens, grouped by the region they hang off. */
const shopLocationNamesByRegion = (scope: ShopScope): ReadonlyMap<string, readonly string[]> => {
  const byRegion = new Map<string, string[]>();
  for (const row of shopSlotLocationsOf(scope)) {
    const names = byRegion.get(row.shop.region) ?? [];
    names.push(row.name);
    byRegion.set(row.shop.region, names);
  }
  return byRegion;
};

export {
  ALL_SHOP_SLOT_LOCATIONS,
  CANONICAL_SLOTS,
  MAX_SHOP_SLOT_DEPTH,
  MIN_SHOP_SLOT_DEPTH,
  clampDepth,
  isShopSlotLocation,
  shopLocationNamesByRegion,
  shopSlotLocationOf,
  shopSlotLocationsOf,
};
export type { CanonicalShopSlot, ShopSlotLocation };
