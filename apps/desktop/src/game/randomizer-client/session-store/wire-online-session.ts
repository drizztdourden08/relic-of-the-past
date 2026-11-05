/* @layer bridge-wasm @kind logic */
import { useSessionStore } from '@drizztdourden08/brock-randomizer/session';
import { rememberNetworkStatus } from '@rotp/randomizer';
import type { OnlineSession } from '@rotp/randomizer';
import { dropOnlinePlacement } from './drop-online-placement';
import { installBridge } from './install-bridge';
import { storeSlots } from './store-slots';

const wireOnlineSession = (session: OnlineSession): OnlineSession => {
  installBridge();
  const isCurrent = (): boolean => useSessionStore.getState().session === session;
  const unsubscribes = [
    session.onNetworkStatus(rememberNetworkStatus),
    session.onPlacement((scouted, owners) => {
      if (!isCurrent()) return;
      storeSlots.foreignOwners = owners;
      useSessionStore.getState().setPlacement(scouted);
    }),
    session.onStatusChange((status) => {
      if (!isCurrent()) return;
      const store = useSessionStore.getState();
      if (status === 'error') dropOnlinePlacement();
      if (status === 'idle') {
        store.setSession(null);
        store.setStatus('idle');
        return;
      }
      store.setStatus(status);
    }),
  ];
  storeSlots.unwire.set(session, () => { for (const unsubscribe of unsubscribes) unsubscribe(); });
  return session;
};

export { wireOnlineSession };
