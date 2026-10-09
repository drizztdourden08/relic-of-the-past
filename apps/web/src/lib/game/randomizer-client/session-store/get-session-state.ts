/* @layer bridge-wasm @kind logic */
import { storeSlots } from './store-slots';
import type { SessionStoreState } from './session-store.type';

const getSessionState = (): SessionStoreState => {
  const { session, placement, foreignOwners, source } = storeSlots;
  return { session, placement, foreignOwners, source };
};

export { getSessionState };
