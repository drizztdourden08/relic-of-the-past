/* @layer shared-game @kind logic */
import { REFERENCE_CAPACITY_PROFILE } from '../../capacity/capacity-profile-defaults';
import { CURRENCY_ROWS } from '../shop-price-options.data';
import { shopPriceCeilingOf } from '../shop-price-ceiling-of';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { Rng } from '../../../rng';
import type { ShopSlotLocation } from '../shop-slot.type';
import type {
  ShopBottleContent, ShopCountedCurrency, ShopPrice, ShopPricePlan, ShopPriceView,
} from '../shop-price.type';

const drawableOf = (plan: ShopPricePlan): ShopCountedCurrency[] =>
  CURRENCY_ROWS.filter((row) => plan[row.currency].enabled).map((row) => row.currency);

const rollCounted = (
  currency: ShopCountedCurrency, plan: ShopPricePlan, profile: CapacityProfile, rng: Rng,
): ShopPrice => {
  const { min, max } = plan[currency];
  const ceiling = shopPriceCeilingOf(currency, plan, profile);
  const low = Math.min(min, ceiling);
  const high = Math.min(max, ceiling);
  return { currency, amount: low + rng.int(high - low + 1) };
};

const rollBottle = (contents: readonly ShopBottleContent[], rng: Rng): ShopPrice =>
  ({ currency: 'bottle', content: contents[rng.int(contents.length)] });

const rollShopPrices = (
  slots: readonly ShopSlotLocation[], plan: ShopPricePlan, rng: Rng,
  profile: CapacityProfile = REFERENCE_CAPACITY_PROFILE,
): ShopPriceView => {
  const counted = drawableOf(plan);
  const bottleUsable = plan.bottle.enabled && plan.bottle.contents.length > 0;
  const view: Record<string, ShopPrice> = {};
  if (counted.length === 0 && !bottleUsable) return view;
  for (const slot of slots) {
    const pick = rng.int(counted.length + (bottleUsable ? 1 : 0));
    view[slot.key] = pick < counted.length
      ? rollCounted(counted[pick], plan, profile, rng)
      : rollBottle(plan.bottle.contents, rng);
  }
  return view;
};

export { rollShopPrices };
