/* @layer shared-game @kind logic */
import { CURRENCY_ROWS } from './shop-price-options';
import { shopPriceCeilingOf } from './shop-price-ceiling-of';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { ShopCountedCurrency, ShopPricePlan } from './shop-price.type';

const priceCeilingsOf = (
  plan: ShopPricePlan, profile: CapacityProfile,
): Readonly<Record<ShopCountedCurrency, number>> =>
  Object.fromEntries(
    CURRENCY_ROWS.map(({ currency }) => [currency, shopPriceCeilingOf(currency, plan, profile)]),
  ) as Record<ShopCountedCurrency, number>;

export { priceCeilingsOf };
