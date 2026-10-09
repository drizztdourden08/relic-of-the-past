/* @layer bridge-wasm @kind logic */
import { notifyUnknownItems } from './notify-unknown-items';
import { trackerState } from './tracker-state';
import type { UnknownItemEntry } from './bridge.type';

const loadUnknownItems = (items: UnknownItemEntry[]): void => {
  trackerState.unknownItems = items;
  notifyUnknownItems();
};

export { loadUnknownItems };
