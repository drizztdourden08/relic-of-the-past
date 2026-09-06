/* @layer renderer-appshell @kind logic */
/**
 * The storage side of profile creation: generate the randomizer placement (local
 * mode), create the profile, pin any frozen settings into its config, persist the
 * placement. Kept apart from useProfileManagement so the hook only orchestrates
 * state — and so a generation failure aborts BEFORE anything reaches disk.
 */
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import { generateFromSnapshot } from '@shared/randomizer/generate';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { log } from '../../lib/log-bus';
import {
  probeDeliverableCapacityLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '../../lib/game/randomizer-client';
import * as profileStore from '../../lib/storage/profile-store';
import { saveRandomizerPlacement } from '../../lib/randomizer-placement-io';

const runCreateProfileFlow = async (opts: CreateProfileOptions): Promise<CreateProfileResult> => {
  // Local mode generates before the profile exists, so a failed generation
  // aborts creation cleanly instead of leaving a profile with no placement.
  let placement: ApPlacement | null = null;
  if (opts.randomizer?.mode === 'local') {
    try {
      // The ported pipeline consumes the frozen snapshot directly (tolerating legacy config
      // shapes). The capability probes name the npc-scope locations and capacity slots the
      // app can physically deliver — the rest stay locked vanilla so the plan can never
      // carry errors.
      const snapshot = normalizeRandomizerOptions(opts.randomizer.options);
      placement = generateFromSnapshot(opts.randomizer.seed, snapshot,
        probeDeliverableNpcLocations(), probeDeliverableCapacityLocations(),
        probeDeliverableWorldLocations());
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Randomizer generation failed: ${message}`);
      return { success: false, error: message };
    }
  }

  const profile = await profileStore.createProfile(opts);

  // A creation-form preset's config values, then any randomizer-pinned setting on top —
  // the pin always wins, since it is what makes the frozen placement play correctly.
  const overrides = { ...opts.initialConfig, ...opts.randomizer?.frozenSettings };
  if (Object.keys(overrides).length > 0) {
    // Merge over the freshly written (empty) config so the values are on disk from day one.
    const current = (await profileStore.readConfig(profile.id)) ?? {};
    await profileStore.writeConfig(profile.id, { ...current, ...overrides });
  }
  if (placement) await saveRandomizerPlacement(profile.id, placement);

  log.app(`Created profile: ${profile.name}`);
  return { success: true, profile };
};

export { runCreateProfileFlow };
