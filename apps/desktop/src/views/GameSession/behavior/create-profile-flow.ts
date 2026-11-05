/* @layer renderer-appshell @kind logic */
import type { CreateProfileOptions, CreateProfileResult } from '@app/profiles/types';
import { log } from '@app/log-bus';
import * as profileStore from '@app/storage/profile-store';
import { withDeliverable } from './with-deliverable';

const failedRoll = (error: unknown): CreateProfileResult => {
  const message = error instanceof Error ? error.message : String(error);
  log.error(`Randomizer generation failed: ${message}`);
  return { success: false, error: message };
};

const runCreateProfileFlow = async (opts: CreateProfileOptions): Promise<CreateProfileResult> => {
  try {
    const profile = await profileStore.createProfile(withDeliverable(opts));
    log.app(`Created profile: ${profile.name}`);
    return { success: true, profile };
  } catch (error) {
    if (opts.randomizer?.mode !== 'local') throw error;
    return failedRoll(error);
  }
};

export { runCreateProfileFlow };
