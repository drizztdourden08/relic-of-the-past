/* @layer bridge-wasm @kind logic */
import { useSessionStore } from '@drizztdourden08/brock-randomizer/session';
import type { Placement } from '@rotp/randomizer';
import { installBridge } from './install-bridge';
import { stopActive } from './stop-active';
import { storeSlots } from './store-slots';
import type { ActiveSession, SessionSource } from './session-store.type';

const activateSession = async (next: ActiveSession, source: SessionSource, placement: Placement | null): Promise<void> => {
  installBridge();
  stopActive();
  storeSlots.source = source;
  const store = useSessionStore.getState();
  store.setSession(next, placement);
  store.setStatus('starting');
  await next.start();
  if (useSessionStore.getState().session === next) useSessionStore.getState().setStatus(next.status);
};

export { activateSession };
