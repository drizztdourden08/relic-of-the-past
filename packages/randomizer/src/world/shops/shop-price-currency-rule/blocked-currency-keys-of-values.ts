/* @layer shared-game @kind logic */
import { currencyKeyOf } from '../shop-price-options';
import { blockedCurrenciesOfValues } from './blocked-currencies-of-values';
import type { OptionValues } from '../../options.type';

const blockedCurrencyKeysOfValues = (values: OptionValues): ReadonlySet<string> =>
  new Set(blockedCurrenciesOfValues(values).map(currencyKeyOf));

export { blockedCurrencyKeysOfValues };
