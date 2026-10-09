/* @layer renderer-components @kind logic */
import type { ShopScope } from '@shared/randomizer/world/shops/shop-scope.type';
import { reclamped } from './reclamped';

const withSlotCount = (scope: ShopScope, slotCount: number): ShopScope =>
  reclamped({ ...scope, slotCount });

export { withSlotCount };
