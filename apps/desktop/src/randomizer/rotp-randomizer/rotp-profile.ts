/* @layer renderer-app @kind logic */
import { buildOptionsSnapshot } from '@rotp/randomizer';
import type { RandomizerGame } from '@drizztdourden08/brock-randomizer';
import { archipeliaFieldsOf } from '../options/archipelia-fields-of';
import { frozenSettingsOf } from '../options/frozen-settings-of';
import { optionValuesOf } from '../options/option-values-of';
import { randomSeed } from '../roll/random-seed';

const rotpProfile: RandomizerGame['profile'] = {
  toConfig: (form, options, values) => {
    const snapshot = buildOptionsSnapshot(optionValuesOf(options));
    const frozenSettings = frozenSettingsOf(snapshot.values);
    return {
      mode: form.mode,
      seed: form.seed.trim() || randomSeed(),
      options: snapshot,
      ...(form.mode === 'archipelia' ? archipeliaFieldsOf(snapshot.values, values) : {}),
      ...(Object.keys(frozenSettings).length > 0 ? { frozenSettings } : {}),
    };
  },
};

export { rotpProfile };
