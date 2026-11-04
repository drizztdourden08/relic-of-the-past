/* @layer renderer-app @kind logic */
import { normalizeRandomizerOptions } from '@rotp/randomizer';
import type { RandomizerGame } from '@drizztdourden08/brock-randomizer';
import { randomSeed } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config/random-seed';

const rotpProfile: RandomizerGame['profile'] = {
  toConfig: (form, options) => ({
    mode: form.mode,
    seed: form.seed.trim() || randomSeed(),
    options: { ...normalizeRandomizerOptions(options) },
  }),
};

export { rotpProfile };
