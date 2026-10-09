/* @layer bridge-wasm @kind logic */
import { clearPendingBoot } from './clear-pending-boot';
import { notifySessionStore } from './notify-session-store';
import { NO_OWNERS } from '@rotp/randomizer';
import { stopActive } from './stop-active';
import { storeSlots } from './store-slots';

const resetSession = (): void => {
  clearPendingBoot();
  stopActive();
  if (storeSlots.placement === null) return;
  storeSlots.placement = null;
  storeSlots.foreignOwners = NO_OWNERS;
  notifySessionStore();
};

export { resetSession };
