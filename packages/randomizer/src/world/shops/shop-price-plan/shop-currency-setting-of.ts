/* @layer shared-game @kind logic */
import { currencyKeyOf, currencyMaxKeyOf, currencyMinKeyOf } from '../shop-price-options.data';
import type { OptionValues } from '../../options.type';
import type { ShopCountedCurrency, ShopCurrencySetting } from '../shop-price.type';

const numberAt = (values: OptionValues, key: string, fallback: number): number => {
  const value = values[key];
  return typeof value === 'number' ? value : fallback;
};

const scaledBy = (amount: number, modifier: number): number => Math.floor((amount * modifier) / 100);

const shopCurrencySettingOf = (
  values: OptionValues, currency: ShopCountedCurrency, max: number, modifier: number, refused: boolean,
): ShopCurrencySetting => {
  const low = numberAt(values, currencyMinKeyOf(currency), 0);
  const high = numberAt(values, currencyMaxKeyOf(currency), max);
  return {
    enabled: values[currencyKeyOf(currency)] === true && !refused,
    min: scaledBy(Math.min(low, high), modifier),
    max: scaledBy(Math.max(low, high), modifier),
  };
};

export { shopCurrencySettingOf };
