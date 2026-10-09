/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import { shopSlotLocationOf } from '@shared/randomizer/world/shops/shop-slots';
import { nativePriceOf } from '@shared/randomizer/world/shops/shop-price-native';
import { ENTRANCE_ANY, OW_AREA_ANY } from './shop-override-key.constants';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { ShopPriceView } from '@shared/randomizer/world/shops/shop-price.type';
import type { ShopKey } from './shop-override-key.type';

const shopOverrideKeyOf = (
  location: LocationKey, shops: ShopScope, prices: ShopPriceView,
): ShopKey | null => {
  const row = shopSlotLocationOf(location);
  if (row === null || row === undefined) return null;
  const { slot, depthIndex } = row;
  const price = prices[location] ?? { currency: 'rupees' as const, amount: slot.price };
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

export { shopOverrideKeyOf };
export type { ShopKey } from './shop-override-key.type';
