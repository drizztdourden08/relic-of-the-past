/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { connectionFieldsOf } from './connection-fields-of';
import { randomSeed } from './random-seed';
import type { RandomizerFormState } from './build-randomizer-config.type';

const allowedMode = (mode: RandomizerFormState['mode'], experimental: boolean): RandomizerFormState['mode'] =>
  (experimental ? mode : 'local');

const buildRandomizerConfig = (form: RandomizerFormState, experimental: boolean): ProfileRandomizerConfig | undefined => {
  if (!form.enabled) return undefined;
  const mode = allowedMode(form.mode, experimental);
  const config: ProfileRandomizerConfig = {
    mode,
    seed: form.seed.trim() || randomSeed(),
    options: buildOptionsSnapshot(randomizerChoiceOverrides(form)),
  };
  if (form.capacity.wallet.mode === 'custom') config.frozenSettings = { carryMoreRupees: true };
  return { ...config, ...connectionFieldsOf(form, mode) };
};

export { buildRandomizerConfig };
