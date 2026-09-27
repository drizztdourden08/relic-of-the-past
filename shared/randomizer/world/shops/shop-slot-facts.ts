/* @layer shared-game @kind logic */
/**
 * The shop surface, read off the shop-slot check records.
 *
 * Every fact about a purchasable spot now lives on its own record: the shelf price, the
 * sprite subtype the seam matches on, the room and door that tell two shops sharing one
 * shelf apart, what the unmodified shop sells there, and the canonical index that is both
 * the id of its sold counter and the order the sequential mode opens slots in. This module
 * only shapes those records into the flat row the engine reads, and derives the two things
 * a record does not need to repeat: the shop's own name, which is the slot's name with its
 * shelf position taken off, and the half of the overworld it stands in, which is the world
 * of the screen it is filed under.
 *
 * CANONICAL ORDER IS APPEND-ONLY. `shop.slot` is the order, not the order the records
 * happen to load in, so a placement stored before a shop was added still names the same
 * slots and reads the same counters.
 *
 * ELEVEN BUILDINGS, FIVE ROOMS, ONE DISCRIMINATOR. Nine shops sell from a shelf, and a
 * building is only a door: the interior it opens is an indoor room, and one room is reused
 * by several doors. So a shop is keyed by (room, entrance, overworld area) and a slot inside
 * it by the sprite's own subtype. The remaining two sell from their own sprites instead of a
 * shelf (the cauldrons and the bomb counter) and have seams of their own. All of that is on
 * each record's `gameId.shopSeam`.
 */
import { all, getScreen } from '@shared/game/data';
import type { CheckId, CheckRecord, ShopSeamKind, ShopSlotPosition } from '@shared/game/data';
import type { ItemId, RegionId } from '@shared/game/data/types/ids';

/** Which half of the overworld a shop's door stands in. */
type ShopWorld = 'light' | 'dark';

/** One purchasable spot, everything the engine asks of it in one flat row. */
interface ShopSlotFacts {
  checkId: CheckId;
  shopId: string;
  /** The shop's own name: what a location name reads before its shelf position. */
  shopName: string;
  /** The region the slot hangs off, which is the region its own check record names. */
  region: RegionId;
  world: ShopWorld;
  position: ShopSlotPosition;
  seam: ShopSeamKind;
  /** What the unmodified shop sells here. */
  vanillaItem: ItemId | undefined;
  /** Rupees the unmodified shop charges: the price a purchase keeps costing. */
  price: number;
  subtype: number;
  roomId: number;
  /** The door's vanilla entrance value, or null when the room alone names the shop. */
  entrance: number | null;
  /** The overworld area the door opens from, or null when no overworld door reaches it. */
  owArea: number | null;
  /** 0-based index across every shop: the slot's stable id and its sold counter. */
  canonicalIndex: number;
}

/** A shop's name is its slot's name with the shelf position taken off the end. */
const shopNameOf = (name: string, position: ShopSlotPosition): string =>
  (position === 'Single' ? name : name.slice(0, name.length - position.length - 1));

const factsOf = (check: CheckRecord): ShopSlotFacts => {
  const { shop, gameId, name, price, vanillaItemIds, screenId, regionId } = check;
  if (shop === undefined || gameId.shopSeam === undefined || price === undefined) {
    throw new Error(`shop-slot check without a shop, a seam or a price: ${check.id}`);
  }
  if (regionId === undefined) throw new Error(`shop-slot check with no region: ${check.id}`);
  const shopName = shopNameOf(name, shop.position);
  const [vanillaItemId] = vanillaItemIds;
  return {
    checkId: check.id,
    shopId: shop.shopId,
    shopName,
    region: regionId,
    world: screenId !== undefined && getScreen(screenId).world === 'dark' ? 'dark' : 'light',
    position: shop.position,
    seam: shop.seam,
    vanillaItem: vanillaItemId,
    price,
    subtype: gameId.shopSeam.subtype,
    roomId: gameId.shopSeam.roomId,
    entrance: gameId.shopSeam.entrance,
    owArea: gameId.shopSeam.owArea,
    canonicalIndex: shop.slot,
  };
};

/** Every canonical slot, in canonical order: the list every mode draws from. */
const CANONICAL_SLOTS: readonly ShopSlotFacts[] = all('check')
  .filter((check) => check.kind === 'shop-slot')
  .map(factsOf)
  .sort((a, b) => a.canonicalIndex - b.canonicalIndex);

/** Every shop, in the canonical order of its first slot. */
const SHOP_IDS: readonly string[] = [...new Set(CANONICAL_SLOTS.map((row) => row.shopId))];

const slotsOfShop = (shopId: string): readonly ShopSlotFacts[] =>
  CANONICAL_SLOTS.filter((row) => row.shopId === shopId);

/** Slots that shipped before the doors were split: canonical indices 0-14. */
const LEGACY_SHOP_SLOT_COUNT = 15;

/** Every canonical slot there is: the ceiling of the whole shop surface. */
const STANDARD_SHOP_SLOT_COUNT = CANONICAL_SLOTS.length;

/** What a list headed by world calls each half. */
const SHOP_WORLD_LABELS: Readonly<Record<ShopWorld, string>> = {
  light: 'Light World',
  dark: 'Dark World',
};

export {
  CANONICAL_SLOTS, LEGACY_SHOP_SLOT_COUNT, SHOP_IDS, SHOP_WORLD_LABELS,
  STANDARD_SHOP_SLOT_COUNT, slotsOfShop,
};
export type { ShopSlotFacts, ShopWorld };
