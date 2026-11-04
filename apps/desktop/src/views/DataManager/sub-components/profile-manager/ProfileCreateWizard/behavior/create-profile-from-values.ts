/* @layer renderer-components @kind logic */
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import type { CreateProfileOptions } from '@app/profiles/types';
import { buildRandomizerConfig } from '../../build-randomizer-config';
import { createArchipeliaProfile } from '../../create-archipelia-profile';
import { applyProfilePreset } from '../../profile-presets';
import type { CreateContext, ProfileWizardValues } from '../ProfileCreateWizard.type';

const createProfileFromValues = async (values: ProfileWizardValues, context: CreateContext): Promise<CreateOutcome> => {
  const { name, rom, preset, language, msuPack, randomizer } = values;
  const { experimental, onCreateProfile, onProgress } = context;
  const overrides = applyProfilePreset(preset);
  const opts: CreateProfileOptions = {
    name: name.trim(),
    romFile: rom,
    language: language || undefined,
    msuPack: msuPack || undefined,
    randomizer: buildRandomizerConfig(randomizer, experimental),
    initialConfig: experimental ? { ...overrides, developerToolsEnabled: true, experimentalFeaturesEnabled: true } : overrides,
  };
  const result = opts.randomizer?.mode === 'archipelia'
    ? await createArchipeliaProfile(opts, randomizer.lobbyCheck, onCreateProfile, { seat: randomizer.lobby.seat, onProgress })
    : await onCreateProfile(opts);
  return result.success ? { success: true, id: result.profile.id } : { success: false, error: result.error };
};

export { createProfileFromValues };
