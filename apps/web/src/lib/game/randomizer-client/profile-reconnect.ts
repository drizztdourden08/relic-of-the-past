/* @layer bridge-wasm @kind logic */
/**
 * A profile's connection changed: the session follows at once. A profile session that is
 * running, retrying or stopped by a refusal is replaced by a fresh one on the new values; a
 * boot still waiting for the game takes them with it. Nothing else runs, so a profile whose
 * game is not up connects at its next boot, as always.
 */
import { log } from '../../log-bus';
import { onlineConfigOfProfile } from './online-config-of-profile';
import { getPendingBoot, getSessionState, setPendingBoot, startOnline } from './session-store';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

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
