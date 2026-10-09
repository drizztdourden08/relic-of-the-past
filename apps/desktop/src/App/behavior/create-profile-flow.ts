/* @layer renderer-appshell @kind logic */
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import { log } from '../../lib/log-bus';
import * as profileStore from '../../lib/storage/profile-store';
import { saveRandomizerPlacement } from '../../lib/randomizer-placement-io';
import { rollPlacement } from './roll-placement';
import { withDeliverable } from './with-deliverable';

const runCreateProfileFlow = async (opts: CreateProfileOptions): Promise<CreateProfileResult> => {
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

  const overrides = { ...opts.initialConfig, ...opts.randomizer?.frozenSettings };
  if (Object.keys(overrides).length > 0) {
    const current = (await profileStore.readConfig(profile.id)) ?? {};
    await profileStore.writeConfig(profile.id, { ...current, ...overrides });
  }
  if (placement) await saveRandomizerPlacement(profile.id, placement);

  log.app(`Created profile: ${profile.name}`);
  return { success: true, profile };
};

export { runCreateProfileFlow };
