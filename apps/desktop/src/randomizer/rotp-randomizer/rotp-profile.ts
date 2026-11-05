/* @layer renderer-app @kind logic */
import { buildOptionsSnapshot } from '@rotp/randomizer';
import type { RandomizerGame } from '@drizztdourden08/brock-randomizer';
import { frozenSettingsOf } from '../options/frozen-settings-of';
import { optionValuesOf } from '../options/option-values-of';
import { randomSeed } from '../roll/random-seed';

const rotpProfile: RandomizerGame['profile'] = {
  toConfig: (form, options) => {
    const snapshot = buildOptionsSnapshot(optionValuesOf(options));
    const frozenSettings = frozenSettingsOf(snapshot.values);
    return {
      mode: form.mode,
      seed: form.seed.trim() || randomSeed(),
      options: snapshot,
      ...(Object.keys(frozenSettings).length > 0 ? { frozenSettings } : {}),
    };
  },
};

export { rotpProfile };
