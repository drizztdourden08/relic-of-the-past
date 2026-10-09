/* @layer renderer-components @kind logic */
import { clampSlotCount, maxSlotCountOf } from '@shared/randomizer/world/shops/shop-scope';
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';

const reclamped = (scope: ShopScope): ShopScope =>
  ({ ...scope, slotCount: clampSlotCount(scope.slotCount, maxSlotCountOf(scope)) });

export { reclamped };
