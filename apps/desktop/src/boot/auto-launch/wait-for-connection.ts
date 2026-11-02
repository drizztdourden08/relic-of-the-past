/* @layer renderer-app @kind logic */
import { getSessionState, subscribeSessionStore } from '@app/game/randomizer-client';
import type { SessionStoreState } from '@app/game/randomizer-client';
import { CONNECTION_WAIT_MS } from './auto-launch.constants';
import type { ConnectionVerdict } from './auto-launch.type';

const verdictOf = ({ session, source }: SessionStoreState): ConnectionVerdict | null => {
  if (session?.kind !== 'online' || source !== 'profile') return null;
  if (session.status === 'active') return 'connected';
  return session.status === 'error' ? 'failed' : null;
};

const waitForConnection = (isCancelled: () => boolean): Promise<ConnectionVerdict> => new Promise((resolve) => {
  const pending: { stop: () => void; timer: ReturnType<typeof setTimeout> | undefined } = { stop: () => undefined, timer: undefined };
  const finish = (verdict: ConnectionVerdict): void => {
    clearTimeout(pending.timer);
    pending.stop();
    resolve(verdict);
  };
  const check = (state: SessionStoreState): void => {
    const verdict = isCancelled() ? 'cancelled' : verdictOf(state);
    if (verdict !== null) finish(verdict);
  };
  pending.timer = setTimeout(() => finish('timed-out'), CONNECTION_WAIT_MS);
  pending.stop = subscribeSessionStore(check);
  check(getSessionState());
});

export { waitForConnection };
