/* @layer renderer-widgets @kind hook */
import { useSyncExternalStore } from 'react';
import { wasmGetReceiveCount } from '@app/game';
import { getCurrentInventory } from '@app/game/tracker';
import type { GrantedItemObservation } from '@rotp/game-core';
import { grantedItemIds, subscribeGrantedItems } from './granted-items-store';

const useGrantedItems = (): readonly GrantedItemObservation[] => {
  const ids = useSyncExternalStore(subscribeGrantedItems, grantedItemIds, grantedItemIds);

  if (ids.length === 0) return [];
  const ownedItemIds = [...getCurrentInventory()];
  return ids.map((itemId) => ({
    itemId,
    receiveCount: wasmGetReceiveCount(itemId),
    ownedItemIds,
    fromInventoryDelta: false,
  }));
};

export { useGrantedItems };
