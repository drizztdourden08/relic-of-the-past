/* @layer renderer-components @kind logic */
import type { ShopScope } from '@rotp/randomizer';
import { reclamped } from './reclamped';

const withSlotCount = (scope: ShopScope, slotCount: number): ShopScope =>
  reclamped({ ...scope, slotCount });

export { withSlotCount };
