/* @layer renderer-appshell @kind logic */
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import type { Placement } from '@rotp/randomizer';
import { log } from '@app/log-bus';
import * as profileStore from '@app/storage/profile-store';
import { saveRandomizerPlacement } from '@app/randomizer-placement-io';
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
