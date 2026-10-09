/* @layer renderer-components @kind logic */
import { maxSlotCountOf, openedSlotIndicesOf, usesSlotCount, clampDepth } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';
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
