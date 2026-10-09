/* @layer renderer-components @kind logic */
import { clampDepth } from '@shared/randomizer/world/shops/shop-slots';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';

const withDepth = (scope: ShopScope, depth: number): ShopScope =>
  ({ ...scope, depth: clampDepth(depth) });

export { withDepth };
