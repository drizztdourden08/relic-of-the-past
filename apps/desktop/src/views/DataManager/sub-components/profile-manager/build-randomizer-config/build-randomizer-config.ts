/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { rotpProfile } from '@app/randomizer/rotp-randomizer/rotp-profile';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { connectionFieldsOf } from './connection-fields-of';
import type { RandomizerFormState } from './build-randomizer-config.type';

const allowedMode = (mode: RandomizerFormState['mode'], experimental: boolean): RandomizerFormState['mode'] =>
  (experimental || mode !== 'online' ? mode : 'local');

const buildRandomizerConfig = (form: RandomizerFormState, experimental: boolean): ProfileRandomizerConfig | undefined => {
  if (!form.enabled) return undefined;
  const mode = allowedMode(form.mode, experimental);
  const config = rotpProfile.toConfig({ enabled: true, seed: form.seed, mode }, randomizerChoiceOverrides(form));
  return { ...config, ...connectionFieldsOf(form, mode) };
};

export { buildRandomizerConfig };
