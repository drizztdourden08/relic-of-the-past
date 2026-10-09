/* @layer shared-game @kind logic */
import { bottleContentKeyOf } from '../../shops/shop-price-options.data';
import { blockedContentsOf } from './blocked-contents-of';
import type { OptionValue } from '../../options.type';
import type { ShopScope } from '../../shops/shop-scope.type';

const potionPriceOverrides = (shops: ShopScope): Readonly<Record<string, OptionValue>> =>
  Object.fromEntries(blockedContentsOf(shops).map((content) => [bottleContentKeyOf(content), false]));

export { potionPriceOverrides };
