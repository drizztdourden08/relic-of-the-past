/* @layer bridge-wasm @kind logic */
import { NO_OWNERS } from './session-store.constants';
import type { SessionStoreSlots } from './session-store.type';

const storeSlots: SessionStoreSlots = {
  session: null,
  placement: null,
  foreignOwners: NO_OWNERS,
  source: null,
  unsubscribeStatus: null,
  unsubscribeNetwork: null,
  pendingBoot: null,
  listeners: new Set(),
};

export { storeSlots };
