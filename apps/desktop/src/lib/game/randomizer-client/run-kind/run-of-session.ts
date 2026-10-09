/* @layer bridge-wasm @kind logic */
import type { SessionStoreState } from '../session-store';
import type { ActiveRun } from '@rotp/randomizer';

const isEndedOnline = (session: SessionStoreState['session']): boolean =>
  session?.kind === 'online' && (session.status === 'idle' || session.status === 'error');

const runOfSession = ({ session, placement }: SessionStoreState): ActiveRun => {
  if (isEndedOnline(session)) return { kind: 'normal' };
  if (session?.kind === 'online') return { kind: 'online' };
  if (placement !== null) return { kind: 'seed', placement };
  return { kind: 'normal' };
};

export { runOfSession };
