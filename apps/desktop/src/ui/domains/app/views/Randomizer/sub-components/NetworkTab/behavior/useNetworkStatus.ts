/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { getSessionState, lastNetworkStatus, subscribeSessionStore } from '@app/lib/game/randomizer-client';
import type { NetworkStatus, OnlineSession, SessionStoreState } from '@app/lib/game/randomizer-client';
import { TICK_MS } from './useNetworkStatus.constants';
import type { NetworkStatusView } from './useNetworkStatus.type';

const onlineOf = (state: SessionStoreState): OnlineSession | null =>
  (state.session?.kind === 'online' ? state.session : null);

const useNetworkStatus = (): NetworkStatusView => {
  const [session, setSession] = useState(() => onlineOf(getSessionState()));
  const [status, setStatus] = useState<NetworkStatus | null>(() => session?.networkStatus ?? null);
  const [now, setNow] = useState(Date.now);

  useEffect(() => subscribeSessionStore((state) => setSession(onlineOf(state))), []);

  useEffect(() => {
    if (session === null) {
      setStatus(null);
      return undefined;
    }
    setStatus(session.networkStatus);
    const unsubscribe = session.onNetworkStatus(setStatus);
    const timer = setInterval(() => {
      setNow(Date.now());
      setStatus(session.networkStatus);
    }, TICK_MS);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [session]);

  return { status, last: status === null ? lastNetworkStatus() : null, now };
};

export { useNetworkStatus };
export type { NetworkStatusView };
