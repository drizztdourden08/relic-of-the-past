/* @layer bridge-wasm @kind logic */
import { useSessionStore } from '@drizztdourden08/brock-randomizer/session';
import { NO_OWNERS } from '@rotp/randomizer';
import { storeSlots } from './store-slots';

const dropOnlinePlacement = (): void => {
  storeSlots.foreignOwners = NO_OWNERS;
  useSessionStore.getState().setPlacement(null);
};

export { dropOnlinePlacement };
