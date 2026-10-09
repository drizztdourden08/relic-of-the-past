/* @layer shared-game @kind logic */
import { shopScopeOfValues } from '../../shops/shop-scope-from-values';
import { reconcilePotionPrices } from './reconcile-potion-prices';
import type { OptionValues } from '../../options.type';
import type { ReconciledPotionPrice } from '../potion-price-rule.type';

const potionPriceStateOfValues = (values: OptionValues): ReconciledPotionPrice =>
  reconcilePotionPrices({ shops: shopScopeOfValues(values), prices: {} });

export { potionPriceStateOfValues };
