/* @layer shared-game @kind types */
import type { OptionValue } from '../options.type';
import type { ShopScope } from '../shops/shop-scope.type';
import type { ShopBottleContent } from '../shops/shop-price.type';

interface PotionPriceSelection {
  shops: ShopScope;
  prices: Readonly<Record<string, OptionValue>>;
}

interface ReconciledPotionPrice {
  prices: Readonly<Record<string, OptionValue>>;
  notes: readonly string[];
  blockedContents: readonly ShopBottleContent[];
  blockedKeys: ReadonlySet<string>;
}

export type { PotionPriceSelection, ReconciledPotionPrice };
