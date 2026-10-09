/* @layer bridge-wasm @kind logic */
import { NO_OWNERS } from './session-store.constants';
import { storeSlots } from './store-slots';

const dropOnlinePlacement = (): void => {
  storeSlots.placement = null;
  storeSlots.foreignOwners = NO_OWNERS;
};

export { dropOnlinePlacement };
