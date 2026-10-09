/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import { trackerState } from './tracker-state';

const getCurrentInventory = (): Set<ItemId> => trackerState.currentInventory;

export { getCurrentInventory };
