/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { onlineConfigOfProfile } from './online-config-of-profile';
import { getPendingBoot, getSessionState, setPendingBoot, startOnline } from './session-store';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const reconnectProfileSession = async (profileId: string, config: ProfileRandomizerConfig): Promise<void> => {
  const pending = getPendingBoot();
  if (pending?.profileId === profileId) setPendingBoot({ ...pending, config });
  const { session, source } = getSessionState();
  if (session?.kind !== 'online' || source !== 'profile') return;
  const next = onlineConfigOfProfile(config);
  log.randomizer(`[Online] Connection edited: reconnecting to ${next.url} as ${next.slotName}`);
  await startOnline(next, 'profile');
};

export { reconnectProfileSession };
