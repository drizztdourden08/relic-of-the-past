/* @layer renderer-components @kind logic */
import type { ShopScope } from '@rotp/randomizer';
import { reclamped } from './reclamped';

const withSlotTicked = (scope: ShopScope, canonicalIndex: number, ticked: boolean): ShopScope => {
  const next = new Set(scope.enabled);
  if (ticked) next.add(canonicalIndex);
  else next.delete(canonicalIndex);
  return reclamped({ ...scope, enabled: [...next].sort((a, b) => a - b) });
};

export { withSlotTicked };
