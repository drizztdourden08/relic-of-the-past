/* @layer shared-game @kind logic */
import { retroBowOfValues } from '../../retro/retro-from-snapshot';
import type { OptionValues } from '../../options.type';
import type { ShopCountedCurrency } from '../shop-price.type';

const blockedCurrenciesOfValues = (values: OptionValues): readonly ShopCountedCurrency[] =>
  (retroBowOfValues(values).enabled ? ['arrows'] : []);

export { blockedCurrenciesOfValues };
