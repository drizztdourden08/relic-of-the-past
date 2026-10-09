/* @layer shared-game @kind logic */
import { lostCauldronsOf } from './lost-cauldrons-of';
import type { ShopBottleContent } from '../../shops/shop-price.type';
import type { ShopScope } from '../../shops/shop-scope.type';

const blockedContentsOf = (shops: ShopScope): readonly ShopBottleContent[] =>
  lostCauldronsOf(shops).map((row) => row.content);

export { blockedContentsOf };
