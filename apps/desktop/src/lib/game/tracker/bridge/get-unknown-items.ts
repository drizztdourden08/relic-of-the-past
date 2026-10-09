/* @layer bridge-wasm @kind logic */
import { trackerState } from './tracker-state';
import type { UnknownItemEntry } from './bridge.type';

const getUnknownItems = (): UnknownItemEntry[] => trackerState.unknownItems;

export { getUnknownItems };
