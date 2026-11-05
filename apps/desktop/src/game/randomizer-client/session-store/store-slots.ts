/* @layer bridge-wasm @kind logic */
import { NO_OWNERS } from '@rotp/randomizer';
import type { StoreSlots } from './store-slots.type';

const storeSlots: StoreSlots = {
  source: null,
  foreignOwners: NO_OWNERS,
  listeners: new Set(),
  unwire: new Map(),
};

export { storeSlots };
