/* @layer shared-game @kind logic */
import { CANONICAL_SLOTS } from '../shop-slot-facts';
import { openedSlotIndicesOf } from '../shop-scope';
import { shopSlotLocationKey } from '../shop-location-keys';
import { clampDepth } from './clamp-depth';
import type { ShopSlotLocation } from '../shop-slot.type';
import type { ShopScope } from '../shop-scope.type';

const shopSlotLocationsOf = (scope: ShopScope): readonly ShopSlotLocation[] => {
  const depth = clampDepth(scope.depth);
  const rows: ShopSlotLocation[] = [];
  for (const canonicalIndex of openedSlotIndicesOf(scope)) {
    const slot = CANONICAL_SLOTS[canonicalIndex];
    for (let depthIndex = 0; depthIndex < depth; depthIndex += 1) {
      rows.push({ slot, key: shopSlotLocationKey(slot, depthIndex), depthIndex });
    }
  }
  return rows;
};

export { shopSlotLocationsOf };
