/* @layer shared-game @kind logic */
import { heartCapOfValues } from '../../difficulty/difficulty-from-snapshot';
import { blockedContentsOfValues } from '../../potion-price/potion-price-rule';
import { BOTTLE_CONTENTS, BOTTLE_KEY, CURRENCY_ROWS, bottleContentKeyOf } from '../shop-price-options';
import { blockedCurrenciesOfValues } from '../shop-price-currency-rule';
import { HEARTS_KEPT_ALIVE } from './shop-price-plan.constants';
import { shopCurrencySettingOf } from './shop-currency-setting-of';
import { shopPriceModifierOf } from './shop-price-modifier-of';
import type { OptionValues } from '../../options.type';
import type { ShopCountedCurrency, ShopCurrencySetting, ShopPricePlan } from '../shop-price.type';

const shopPricePlanOf = (values: OptionValues): ShopPricePlan => {
  const modifier = shopPriceModifierOf(values);
  const refused = new Set(blockedCurrenciesOfValues(values));
  const byCurrency = Object.fromEntries(
    CURRENCY_ROWS.map((row) =>
      [row.currency, shopCurrencySettingOf(values, row, modifier, refused.has(row.currency))]),
  ) as Record<ShopCountedCurrency, ShopCurrencySetting>;
  const unbuyable = new Set(blockedContentsOfValues(values));
  return {
    ...byCurrency,
    bottle: {
      enabled: values[BOTTLE_KEY] === true,
      contents: BOTTLE_CONTENTS
        .filter(({ content }) => values[bottleContentKeyOf(content)] !== false && !unbuyable.has(content))
        .map(({ content }) => content),
    },
    heartCeiling: heartCapOfValues(values) - HEARTS_KEPT_ALIVE,
  };
};

export { shopPricePlanOf };
