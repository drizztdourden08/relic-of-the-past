/* @layer bridge-wasm @kind logic */
import type { SessionStoreState } from '../session-store';
import type { RunKind } from '@rotp/game-data';

const isEndedOnline = (session: SessionStoreState['session']): boolean =>
  session?.kind === 'online' && (session.status === 'idle' || session.status === 'error');

const runOfSession = ({ session, placement }: SessionStoreState): RunKind => {
  if (isEndedOnline(session)) return 'normal';
  if (session?.kind === 'online') return 'online';
  return placement === null ? 'normal' : 'seed';
};

export { runOfSession };
