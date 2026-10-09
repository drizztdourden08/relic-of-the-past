/* @layer bridge-wasm @kind logic */
import { createOnlineSession } from '../online-session';
import { rememberNetworkStatus } from '@rotp/randomizer';
import { adoptSession } from './adopt-session';
import { notifySessionStore } from './notify-session-store';
import { NO_OWNERS } from '@rotp/randomizer';
import { storeSlots } from './store-slots';
import type { OnlineSessionConfig } from '../online-session';
import type { SessionSource } from './session-store.type';

const startOnline = async (config: OnlineSessionConfig, nextSource: SessionSource): Promise<void> => {
  const next = createOnlineSession(config);
  storeSlots.placement = null;
  storeSlots.foreignOwners = NO_OWNERS;
  adoptSession(next, nextSource);
  storeSlots.unsubscribeNetwork = next.onNetworkStatus(rememberNetworkStatus);
  next.onPlacement((scouted, owners) => {
    if (storeSlots.session !== next) return;
    storeSlots.placement = scouted;
    storeSlots.foreignOwners = owners;
    notifySessionStore();
  });
  await next.start();
};

export { startOnline };
