/* @layer bridge-wasm @kind logic */
import type { ForeignOwners } from '@rotp/randomizer';
import { notifySessionStore } from './notify-session-store';
import { storeSlots } from './store-slots';

const setForeignOwners = (owners: ForeignOwners): void => {
  storeSlots.foreignOwners = owners;
  notifySessionStore();
};

export { setForeignOwners };
