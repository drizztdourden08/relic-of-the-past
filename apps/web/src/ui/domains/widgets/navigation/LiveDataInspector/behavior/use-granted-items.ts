/* @layer renderer-widgets @kind hook */
/**
 * `grantedItems` for the current pass, meaning every raw item id the native receive
 * path has granted this session, resolved against the live receive tally and
 * the tracker's current owned set. `fromInventoryDelta` is always false here:
 * every id in the session set came off the direct receive callback
 * (`onItemReceived`/`onUnknownItem`), never a guessed inventory diff, so the
 * evidence is native and `item-grants` may grade it `certain`.
 */
import { useSyncExternalStore } from 'react';
import { wasmGetReceiveCount } from '@app/lib/game';
import { getCurrentInventory } from '@app/lib/game/tracker';
import type { GrantedItemObservation } from '@shared/game/recommendations';
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
