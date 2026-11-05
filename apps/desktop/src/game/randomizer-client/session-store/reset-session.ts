/* @layer bridge-wasm @kind logic */
import { useSessionStore } from '@drizztdourden08/brock-randomizer/session';
import { clearPendingBoot } from './clear-pending-boot';
import { dropOnlinePlacement } from './drop-online-placement';
import { stopActive } from './stop-active';

const resetSession = (): void => {
  clearPendingBoot();
  stopActive();
  if (useSessionStore.getState().placement !== null) dropOnlinePlacement();
};

export { resetSession };
