/* @layer shared-game @kind logic */
import {
  SHOP_PRICE_MODIFIER_DEFAULT, SHOP_PRICE_MODIFIER_KEY, SHOP_PRICE_MODIFIER_MAX, SHOP_PRICE_MODIFIER_MIN,
} from '../shop-price-options.data';
import type { OptionValues } from '../../options.type';

const shopPriceModifierOf = (values: OptionValues): number => {
  const stored = values[SHOP_PRICE_MODIFIER_KEY];
  const asked = typeof stored === 'number' ? stored : SHOP_PRICE_MODIFIER_DEFAULT;
  return Math.min(SHOP_PRICE_MODIFIER_MAX, Math.max(SHOP_PRICE_MODIFIER_MIN, Math.round(asked)));
};

export { shopPriceModifierOf };
