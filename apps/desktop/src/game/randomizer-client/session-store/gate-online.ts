/* @layer bridge-wasm @kind logic */
import { appRandomizerLog } from '@drizztdourden08/brock-randomizer/session';
import type { PendingBoot } from '@drizztdourden08/brock-randomizer/session';
import { normalizeServerUrl, probeOnlineServer } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const gateOnline = async (profileId: string, config: ProfileRandomizerConfig): Promise<PendingBoot | null> => {
  const url = normalizeServerUrl(config.serverUrl ?? '');
  if (!url) {
    appRandomizerLog('Randomizer boot blocked: this online profile has no server URL', 'error');
    return null;
  }
  const probe = await probeOnlineServer({ url });
  if (probe.ok) {
    appRandomizerLog(`[Boot] Gate passed: server pre-flight ok (${url}, server ${probe.version ?? 'unknown'})`);
  } else {
    appRandomizerLog(`[Boot] Server pre-flight failed (${probe.reason}); the game boots and the session keeps trying`, 'warn');
  }
  return { profileId, mode: 'online', config };
};

export { gateOnline };
