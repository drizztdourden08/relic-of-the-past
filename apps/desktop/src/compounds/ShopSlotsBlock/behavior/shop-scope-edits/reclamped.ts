/* @layer renderer-components @kind logic */
import { clampSlotCount, maxSlotCountOf } from '@rotp/randomizer';
import type { ShopScope } from '@rotp/randomizer';

const reclamped = (scope: ShopScope): ShopScope =>
  ({ ...scope, slotCount: clampSlotCount(scope.slotCount, maxSlotCountOf(scope)) });

export { reclamped };
