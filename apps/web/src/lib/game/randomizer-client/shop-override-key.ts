/* @layer bridge-wasm @kind logic */
/**
 * The in-core substitution key of a shop-slot location.
 *
 * Shop slots have no check record — the app has never had a physical record
 * for a shelf, because in the unmodified game a shelf is not a check at all,
 * it is a repeatable purchase. So this key is derived from the shop dataset
 * rather than looked up: the shelf's room, the entrance that disambiguates a
 * shared room, and the shelf sprite's own subtype, which is unique inside
 * any one shop. Together those name exactly one shelf in the running game.
 *
 * The depth pair rides along so the core knows which purchase of the slot
 * this entry is, and when the slot runs out.
 */
import { shopSlotLocationOf } from '@shared/randomizer/ap-world/shops/shop-slots';
import { nativePriceOf } from '@shared/randomizer/ap-world/shops/shop-price-native';
import type { ShopScope } from '@shared/randomizer/ap-world/shops/shop-scope.type';
import type { ShopPriceView } from '@shared/randomizer/ap-world/shops/shop-price.type';
import type { PlanShopOverride } from './physical-plan.type';

/** The core's "match anything" values, for a shop the earlier fields already name. */
const ENTRANCE_ANY = -1;
const OW_AREA_ANY = -1;

type ShopKey = Omit<PlanShopOverride, 'targetLocalId'>;

const shopOverrideKeyOf = (
  locationName: string, shops: ShopScope, prices: ShopPriceView,
): ShopKey | null => {
  const row = shopSlotLocationOf(locationName);
  if (row === null || row === undefined) return null;
  const { shop, slot, depthIndex, canonicalIndex } = row;
  // A rolled price replaces the shelf's own; with nothing rolled the shelf
  // keeps charging the rupees the unmodified game charges.
  const price = prices[locationName] ?? { currency: 'rupees' as const, amount: slot.price };
  return {
    slotIndex: canonicalIndex,
    roomId: shop.roomId,
    entrance: shop.entrance ?? ENTRANCE_ANY,
    owArea: shop.owArea ?? OW_AREA_ANY,
    subtype: slot.subtype,
    depthIndex,
    depth: shops.depth,
    ...nativePriceOf(price),
  };
};

export { ENTRANCE_ANY, shopOverrideKeyOf };
export type { ShopKey };
