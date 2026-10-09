/* @layer shared-game @kind logic */
import { REFERENCE_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { NO_SHOP_SCOPE } from '../shops/shop-scope-from-values';
import { rollShopPrices, shopPricePlanOf } from '../shops/shop-price-plan';
import { shopSlotLocationsOf } from '../shops/shop-slots';
import type { ShopPriceView } from '../shops/shop-price.type';
import type { RollInput } from './fill.type';

const rollPrices = (input: RollInput): ShopPriceView => {
  const { values, options, rng } = input;
  const capacity = options.capacity ?? REFERENCE_CAPACITY_PROFILE;
  return rollShopPrices(
    shopSlotLocationsOf(options.shops ?? NO_SHOP_SCOPE), shopPricePlanOf(values), rng, capacity,
  );
};

export { rollPrices };
