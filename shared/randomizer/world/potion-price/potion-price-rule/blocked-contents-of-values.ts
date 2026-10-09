/* @layer shared-game @kind logic */
import { shopScopeOfValues } from '../../shops/shop-scope-from-values';
import { blockedContentsOf } from './blocked-contents-of';
import type { OptionValues } from '../../options.type';
import type { ShopBottleContent } from '../../shops/shop-price.type';

const blockedContentsOfValues = (values: OptionValues): readonly ShopBottleContent[] =>
  blockedContentsOf(shopScopeOfValues(values));

export { blockedContentsOfValues };
