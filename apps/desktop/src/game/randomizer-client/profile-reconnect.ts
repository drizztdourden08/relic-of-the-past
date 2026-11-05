/* @layer bridge-wasm @kind logic */
import { onlineConnectionOf } from '@drizztdourden08/brock-randomizer/session';
import { log } from '../../log-bus';
import { getPendingBoot, getSessionState, setPendingBoot } from './session-store';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const reconnectProfileSession = (profileId: string, config: ProfileRandomizerConfig): void => {
  const pending = getPendingBoot();
  if (pending?.profileId === profileId) setPendingBoot({ ...pending, config });
  const { session, source } = getSessionState();
  if (session?.kind !== 'online' || source !== 'profile' || !('reconnect' in session)) return;
  const next = onlineConnectionOf(config);
  if (next === null) return;
  log.randomizer(`[Online] Connection edited: reconnecting to ${next.url} as ${next.slotName}`);
  session.reconnect(next);
};

export { reconnectProfileSession };
