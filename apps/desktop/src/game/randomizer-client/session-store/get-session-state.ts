/* @layer bridge-wasm @kind logic */
import { useSessionStore } from '@drizztdourden08/brock-randomizer/session';
import { isRotpPlacement } from '@app/randomizer/rotp-randomizer/rotp-is-placement';
import { isActiveSession } from './is-active-session';
import { storeSlots } from './store-slots';
import type { SessionStoreState } from './session-store.type';

const getSessionState = (): SessionStoreState => {
  const { session, placement } = useSessionStore.getState();
  const active = isActiveSession(session) ? session : null;
  return {
    session: active,
    placement: isRotpPlacement(placement) ? placement : null,
    foreignOwners: storeSlots.foreignOwners,
    source: storeSlots.source ?? (active === null ? null : 'profile'),
  };
};

export { getSessionState };
