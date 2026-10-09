/* @layer renderer-components @kind logic */
import { clampCount, maxSlotCountOf } from '@shared/randomizer/world/shops/shop-scope';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';

const reclamped = (scope: ShopScope): ShopScope =>
  ({ ...scope, slotCount: clampCount(scope.slotCount, maxSlotCountOf(scope)) });

export { reclamped };
