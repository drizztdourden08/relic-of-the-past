/* @layer renderer-appshell @kind logic */
/**
 * The storage side of profile creation: generate the randomizer placement (local
 * mode), create the profile, pin any frozen settings into its config, persist the
 * placement. Kept apart from useProfileManagement so the hook only orchestrates
 * state, so a generation failure aborts BEFORE anything reaches disk.
 */
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { deliverableListsOf } from '@shared/randomizer/world/fill/deliverable-lists';
import { log } from '../../lib/log-bus';
import {
  probeDeliverablePondLocations, probeDeliverableNpcLocations, probeDeliverableWorldLocations,
} from '../../lib/game/randomizer-client';
import * as profileStore from '../../lib/storage/profile-store';
import { saveRandomizerPlacement } from '../../lib/randomizer-placement-io';
import { rollPlacement } from './roll-placement';

/**
 * An online profile keeps the probed spots on its config, so the player file written later
 * randomizes the same npc, pond and world spots a local seed of this profile would.
 */
const withDeliverable = (opts: CreateProfileOptions): CreateProfileOptions => {
  const { randomizer } = opts;
  if (randomizer?.mode !== 'online') return opts;
  const deliverable = deliverableListsOf({
    npc: probeDeliverableNpcLocations(),
    capacity: probeDeliverablePondLocations(),
    world: probeDeliverableWorldLocations(),
  });
  return { ...opts, randomizer: { ...randomizer, deliverable } };
};

const runCreateProfileFlow = async (opts: CreateProfileOptions): Promise<CreateProfileResult> => {
  // Local mode generates before the profile exists, so a failed generation
  // aborts creation instead of leaving a profile with no placement.
  let placement: Placement | null = null;
  if (opts.randomizer?.mode === 'local') {
    try {
      placement = rollPlacement(opts.randomizer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Randomizer generation failed: ${message}`);
      return { success: false, error: message };
    }
  }

  const profile = await profileStore.createProfile(withDeliverable(opts));

  // A creation-form preset's config values, then any randomizer-pinned setting on top,
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
