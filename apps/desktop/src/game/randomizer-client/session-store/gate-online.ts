/* @layer bridge-wasm @kind logic */
import { appRandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import type { PendingBoot } from '@drizztdourden08/brock-randomizer/session';
import { normalizeServerUrl, probeOnlineServer } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { onlineConfigOfProfile } from '../online-config-of-profile';
import { onlineSlotName } from '@app/randomizer/rotp-randomizer/online-slot-name-slot';

const gateOnline = async (profileId: string, config: ProfileRandomizerConfig): Promise<PendingBoot | null> => {
  const url = normalizeServerUrl(config.serverUrl ?? '');
  const probe = await probeOnlineServer({ url });
  onlineSlotName.current = onlineConfigOfProfile(config).slotName;
  if (probe.ok) {
    appRandomizerLog(`[Boot] Gate passed: server pre-flight ok (${url}, server ${probe.version ?? 'unknown'})`);
  } else {
    appRandomizerLog(`[Boot] Server pre-flight failed (${probe.reason}); the game boots and the session keeps trying`, 'warn');
  }
  return { profileId, mode: 'online', config };
};

export { gateOnline };
