/* @layer bridge-wasm @kind logic */
import { rememberNetworkStatus } from '../last-network-status';
import { dropOnlinePlacement } from './drop-online-placement';
import { storeSlots } from './store-slots';
import type { OnlineSession } from '../online-session';

const keepLastNetworkStatus = (active: OnlineSession): void => {
  storeSlots.unsubscribeNetwork?.();
  storeSlots.unsubscribeNetwork = null;
  try { rememberNetworkStatus(active.networkStatus); } catch { return; }
};

const clearActive = (): void => {
  storeSlots.unsubscribeStatus?.();
  storeSlots.unsubscribeStatus = null;
  if (storeSlots.session?.kind === 'online') {
    keepLastNetworkStatus(storeSlots.session);
    dropOnlinePlacement();
  }
  storeSlots.session = null;
  storeSlots.source = null;
};

export { clearActive };
