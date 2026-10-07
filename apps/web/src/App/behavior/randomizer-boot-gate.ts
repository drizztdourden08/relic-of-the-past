/* @layer renderer-appshell @kind logic */
/**
 * Pre-boot gate for randomized profiles. Local mode needs a placement this build can
 * read, rolled again from the seed when the file is older; online mode needs a server URL. The live server pre-flight only
 * logs: a server that is down never blocks play, the session retries it. On success the
 * boot's session material is parked in the session store's pending slot, where
 * the auto-start hook (useRandomizerBoot) consumes it once the game is running.
 * On failure the caller aborts the boot with the returned reason.
 */
import { log } from '../../lib/log-bus';
import { loadRandomizerPlacement, saveRandomizerPlacement } from '../../lib/randomizer-placement-io';
import { rollPlacement } from './roll-placement';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import {
  normalizeServerUrl, probeOnlineServer, setPendingBoot,
} from '../../lib/game/randomizer-client';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

type GateResult = { ok: true } | { ok: false; reason: string };

/**
 * A placement file this build cannot read (missing, or written under an older schema) is
 * rolled again from the profile's own seed and options, then saved, so the profile boots.
 */
const rerollPlacement = async (profileId: string, config: ProfileRandomizerConfig): Promise<Placement | null> => {
  try {
    const placement = rollPlacement(config);
    await saveRandomizerPlacement(profileId, placement);
    log.randomizer(`[Boot] Placement file unreadable by this build; rolled seed ${config.seed} again`, 'warn');
    return placement;
  } catch (error) {
    log.error(`Randomizer generation failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

const gateRandomizerBoot = async (profileId: string, config: ProfileRandomizerConfig): Promise<GateResult> => {
  if (config.mode === 'local') {
    const placement = await loadRandomizerPlacement(profileId) ?? await rerollPlacement(profileId, config);
    if (!placement) {
      return { ok: false, reason: 'Randomizer boot blocked: this profile\'s seed could not be rolled' };
    }
    setPendingBoot({ profileId, config, placement });
    log.randomizer(`[Boot] Gate passed: local placement loaded (seed ${placement.seed}, ${Object.keys(placement.locations).length} locations, ${placement.spheres.length} spheres)`);
    return { ok: true };
  }

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
export type { GateResult };
