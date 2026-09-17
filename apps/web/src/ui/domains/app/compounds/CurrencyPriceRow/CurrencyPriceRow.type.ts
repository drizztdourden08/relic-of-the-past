/* @layer renderer-components @kind types */
/**
 * The shapes a currency-price section hands this compound. The rows and the
 * keys behind them belong to whichever options block is drawing them, so the
 * row components and their behavior take both as plain data and never reach
 * for one block's catalog keys.
 */
import type { ShopBottleContent, ShopCountedCurrency } from '@shared/randomizer/ap-world/shops/shop-price.type';

/** Where a block's catalog keys come from: the opt-in and the two range ends. */
interface CurrencyKeyHelpers {
  keyOf: (currency: ShopCountedCurrency) => string;
  minKeyOf: (currency: ShopCountedCurrency) => string;
  maxKeyOf: (currency: ShopCountedCurrency) => string;
}

interface BottleContentRowModel {
  content: ShopBottleContent;
  /** The content in the player's own words. */
  label: string;
  /** Its catalog key: what an edit on this row writes. */
  key: string;
  checked: boolean;
  /** Its cauldron went to the shuffle: the row is greyed and cannot be ticked. */
  blocked: boolean;
  /** Why this row is greyed; empty while it is not. */
  note: string;
}

export type { BottleContentRowModel, CurrencyKeyHelpers };
