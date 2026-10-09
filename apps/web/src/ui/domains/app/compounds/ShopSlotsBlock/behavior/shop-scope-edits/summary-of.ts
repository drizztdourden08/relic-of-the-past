/* @layer renderer-components @kind logic */
import { maxSlotCountOf, openedSlotIndicesOf, usesSlotCount } from '@shared/randomizer/world/shops/shop-scope';
import { clampDepth } from '@shared/randomizer/world/shops/shop-slots';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import type { ShopScopeSummary } from '../../ShopSlotsBlock.type';

const summaryOf = (scope: ShopScope): ShopScopeSummary => {
  const opened = openedSlotIndicesOf(scope).length;
  const depth = clampDepth(scope.depth);
  return {
    ticked: maxSlotCountOf(scope),
    opened,
    depth,
    locations: opened * depth,
    counts: usesSlotCount(scope.mode),
    active: scope.mode !== 'vanilla',
  };
};

export { summaryOf };
