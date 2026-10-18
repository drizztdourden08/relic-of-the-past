/* @layer renderer-appshell @kind logic */
import { log } from '@app/log-bus';
import { loadRandomizerPlacement } from '@app/randomizer-placement-io';
import {
  normalizeServerUrl, probeOnlineServer, setPendingBoot,
} from '@app/game/randomizer-client';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { GateResult } from './randomizer-boot-gate.type';
import { rerollPlacement } from './reroll-placement';

const gateRandomizerBoot = async (profileId: string, config: ProfileRandomizerConfig, experimental: boolean): Promise<GateResult> => {
  if (config.mode === 'local') {
    const placement = await loadRandomizerPlacement(profileId) ?? await rerollPlacement(profileId, config);
    if (!placement) {
      return { ok: false, reason: 'Randomizer boot blocked: this profile\'s seed could not be rolled' };
    }
    setPendingBoot({ profileId, config, placement });
    log.randomizer(`[Boot] Gate passed: local placement loaded (seed ${placement.seed}, ${Object.keys(placement.locations).length} locations, ${placement.spheres.length} spheres)`);
    return { ok: true };
  }

  if (!experimental) return { ok: false, reason: 'Archipelago requires Experimental Features in Contributing settings' };
  const url = normalizeServerUrl(config.serverUrl ?? '');
  if (!url) {
    return { ok: false, reason: 'Randomizer boot blocked: this online profile has no server URL' };
  }
  const probe = await probeOnlineServer({ url });
  setPendingBoot({ profileId, config, placement: null });
  if (probe.ok) {
    log.randomizer(`[Boot] Gate passed: server pre-flight ok (${url}, server ${probe.version ?? 'unknown'})`);
  } else {
    log.randomizer(`[Boot] Server pre-flight failed (${probe.reason}); the game boots and the session keeps trying`, 'warn');
  }
  return { ok: true };
};

export { gateRandomizerBoot };
