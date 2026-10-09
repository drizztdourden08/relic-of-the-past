/* @layer shared-game @kind logic */
import { RETRO_ARROWS_NOTE } from './shop-price-currency-rule.constants';
import type { ShopCountedCurrency } from '../shop-price.type';

const blockedCurrencyNote = (currency: ShopCountedCurrency): string =>
  (currency === 'arrows' ? RETRO_ARROWS_NOTE : '');

export { blockedCurrencyNote };
