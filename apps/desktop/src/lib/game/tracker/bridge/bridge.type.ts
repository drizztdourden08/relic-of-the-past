/* @layer bridge-wasm @kind types */
import type { CheckId, ItemId } from '@rotp/game-data';

type ItemReceivedListener = (itemId: ItemId, nativeItemId: number, method: number) => void;
type InventoryChangedListener = (inventory: Set<ItemId>) => void;
type UnknownItemEntry = { id: number; method: number; timestamp: number };
type UnknownItemListener = (items: UnknownItemEntry[]) => void;
type CompletedChecksListener = (checks: Set<CheckId>) => void;
type EventStatusListener = (status: ReadonlyMap<CheckId, boolean>) => void;

interface TrackerState {
  readonly itemListeners: Set<ItemReceivedListener>;
  readonly inventoryListeners: Set<InventoryChangedListener>;
  readonly unknownItemListeners: Set<UnknownItemListener>;
  readonly completedChecksListeners: Set<CompletedChecksListener>;
  readonly eventStatusListeners: Set<EventStatusListener>;
  currentInventory: Set<ItemId>;
  currentCompletedChecks: Set<CheckId>;
  currentEventStatus: Map<CheckId, boolean>;
  unknownItems: UnknownItemEntry[];
  pollIntervalId: ReturnType<typeof setInterval> | null;
}

export type {
  ItemReceivedListener, InventoryChangedListener, UnknownItemEntry, UnknownItemListener,
  CompletedChecksListener, EventStatusListener, TrackerState,
};
