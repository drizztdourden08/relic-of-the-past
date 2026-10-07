/* @layer renderer-components @kind hook */
/**
 * The active online session's network status, out of the shared session store. Every change
 * the session reports lands at once; a one-second tick moves `now` (ages, countdowns) and
 * reads the status again, since the game side (the received index, a file in play) moves
 * without a packet. Null with no online session; `last` is then the last picture the app saw
 * of one, if any (last-network-status.ts).
 */
import { useEffect, useState } from 'react';
import { getSessionState, lastNetworkStatus, subscribeSessionStore } from '@app/lib/game/randomizer-client';
import type { NetworkStatus, OnlineSession, SessionStoreState } from '@app/lib/game/randomizer-client';

const TICK_MS = 1000;

const onlineOf = (state: SessionStoreState): OnlineSession | null =>
  (state.session?.kind === 'online' ? state.session : null);

interface NetworkStatusView {
  status: NetworkStatus | null;
  /** While no session runs: the last session's picture, or null when there was none. */
  last: NetworkStatus | null;
  now: number;
}

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
