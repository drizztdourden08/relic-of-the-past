/* @layer shared-game @kind types */
import type { ShopCountedCurrency } from '../shop-price.type';

interface CurrencyRow {
  currency: ShopCountedCurrency;
  max: number;
}

export type { CurrencyRow };
