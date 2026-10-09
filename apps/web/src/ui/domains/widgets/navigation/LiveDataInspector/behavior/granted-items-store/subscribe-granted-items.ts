/* @layer renderer-widgets @kind logic */
import { onItemReceived, onUnknownItem } from '@app/lib/game/tracker';
import { grantedItemsState } from './granted-items-state';

const notify = (): void => {
  for (const listener of grantedItemsState.listeners) listener();
};

const add = (rawItemId: number): void => {
  if (grantedItemsState.granted.has(rawItemId)) return;
  grantedItemsState.granted.add(rawItemId);
  grantedItemsState.snapshot = [...grantedItemsState.granted];
  notify();
};

const ensureWired = (): void => {
  if (grantedItemsState.wired) return;
  grantedItemsState.wired = true;
  onItemReceived((_itemId, nativeItemId) => add(nativeItemId));
  onUnknownItem((entries) => { for (const entry of entries) add(entry.id); });
};

const subscribeGrantedItems = (listener: () => void): (() => void) => {
  ensureWired();
  grantedItemsState.listeners.add(listener);
  return () => { grantedItemsState.listeners.delete(listener); };
};

export { subscribeGrantedItems };
