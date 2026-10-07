/* @layer bridge-wasm @kind logic */
/**
 * The in-core substitution key of a shop-slot location.
 *
 * The key comes off the slot's own check record (`gameId.shopSeam`): the shelf's room, the
 * entrance and overworld area that disambiguate a room several doors share, and the shelf
 * sprite's own subtype, which is unique inside any one shop. Together those name exactly one
 * shelf in the running game. A restock past the first has no record of its own, because the
 * unmodified game has no such spot; it takes the first one's seam and its own depth index.
 *
 * The depth pair rides along so the core knows which purchase of the slot
 * this entry is, and when the slot runs out.
 */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { shopSlotLocationOf } from '@shared/randomizer/world/shops/shop-slots';
import { nativePriceOf } from '@shared/randomizer/world/shops/shop-price-native';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { ShopPriceView } from '@shared/randomizer/world/shops/shop-price.type';
import type { PlanShopOverride } from './physical-plan.type';

/** The core's "match anything" values, for a shop the earlier fields already name. */
const ENTRANCE_ANY = -1;
const OW_AREA_ANY = -1;

type ShopKey = Omit<PlanShopOverride, 'targetLocalId'>;

const shopOverrideKeyOf = (
  location: LocationKey, shops: ShopScope, prices: ShopPriceView,
): ShopKey | null => {
  const row = shopSlotLocationOf(location);
  if (row === null || row === undefined) return null;
  const { slot, depthIndex } = row;
  // A rolled price replaces the shelf's own; with nothing rolled the shelf
  // keeps charging the rupees the unmodified game charges.
  const price = prices[location] ?? { currency: 'rupees' as const, amount: slot.price };
  // A price with no native form (shop-price-native.ts) cannot be sent at all,
  // so the shelf gets no override and keeps what the unmodified game put on
  // it. Only an item price is shaped that way, and no shelf can roll one, so
  // this is the shape of the refusal and not a case that runs.
  const native = nativePriceOf(price);
  if (native === null) return null;
  return {
    slotIndex: slot.canonicalIndex,
    roomId: slot.roomId,
    entrance: slot.entrance ?? ENTRANCE_ANY,
    owArea: slot.owArea ?? OW_AREA_ANY,
    subtype: slot.subtype,
    depthIndex,
    depth: shops.depth,
    ...native,
  };
};

export { ENTRANCE_ANY, shopOverrideKeyOf };
export type { ShopKey };
