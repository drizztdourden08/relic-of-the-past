/* @layer renderer-widgets @kind logic */
/**
 * Every raw item id the native receive path has granted this session, kept as
 * a plain module Set, not component state: the tracker bridge's listeners
 * (`onItemReceived`/`onUnknownItem`) fire whether or not a widget is mounted.
 * `onItemReceived`'s `nativeItemId` and `onUnknownItem`'s `id` are the SAME raw
 * index space `GrantedItemObservation.itemId` wants, so both feed the one set.
 * A granted id with no dataset record is the case `item-grants`' `create` draft exists for.
 */
import { onItemReceived, onUnknownItem } from '@app/lib/game/tracker';

const granted = new Set<number>();
const listeners = new Set<() => void>();

/**
 * The snapshot `useSyncExternalStore` compares by reference. Rebuilt only when
 * `add` changes the set, never per read: a fresh array on every call reads as
 * "changed" every render and free-runs the subscriber into React's update-depth limit.
 */
let snapshot: readonly number[] = [];

let wired = false;

const notify = (): void => {
  for (const listener of listeners) listener();
};

const add = (rawItemId: number): void => {
  if (granted.has(rawItemId)) return;
  granted.add(rawItemId);
  snapshot = [...granted];
  notify();
};

/** Wires the session listeners exactly once, however many hooks subscribe. */
const ensureWired = (): void => {
  if (wired) return;
  wired = true;
  onItemReceived((_itemId, nativeItemId) => add(nativeItemId));
  onUnknownItem((entries) => { for (const entry of entries) add(entry.id); });
};

const subscribeGrantedItems = (listener: () => void): (() => void) => {
  ensureWired();
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const grantedItemIds = (): readonly number[] => snapshot;

export { grantedItemIds, subscribeGrantedItems };
