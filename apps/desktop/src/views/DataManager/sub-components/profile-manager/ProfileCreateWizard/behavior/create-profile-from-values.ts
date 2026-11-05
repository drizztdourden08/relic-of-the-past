/* @layer renderer-components @kind logic */
import { wizardCreateOptions } from '@drizztdourden08/brock-react';
import type { CreateOutcome } from '@drizztdourden08/tessera/composites';
import type { CreateProfileOptions } from '@app/profiles/types';
import { applyProfilePreset } from '../../profile-presets';
import type { CreateContext, ProfileWizardValues } from '../ProfileCreateWizard.type';

const createProfileFromValues = async (values: ProfileWizardValues, context: CreateContext): Promise<CreateOutcome> => {
  const { name, rom, preset, language, msuPack } = values;
  const { experimental, modules, onCreateProfile } = context;
  const overrides = applyProfilePreset(preset);
  const opts: CreateProfileOptions = {
    name: name.trim(),
    romFile: rom,
    language: language || undefined,
    msuPack: msuPack || undefined,
    ...wizardCreateOptions(modules, values),
    initialConfig: experimental ? { ...overrides, developerToolsEnabled: true, experimentalFeaturesEnabled: true } : overrides,
  };
  const result = await onCreateProfile(opts);
  return result.success ? { success: true, id: result.profile.id } : { success: false, error: result.error };
};

export { createProfileFromValues };
