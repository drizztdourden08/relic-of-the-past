/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useSettings } from '@drizztdourden08/brock-react';
import { experimentalFeaturesEnabled } from '@rotp/features';
import type { AppSettings } from '@app/settings.type';
import { buildRandomizerConfig, randomizerFormError } from './build-randomizer-config';
import { createArchipeliaProfile } from './create-archipelia-profile';
import type { UseCreateProfileParams } from './profile-manager.type';

const useCreateProfile = (params: UseCreateProfileParams) => {
  const { settings } = useSettings<AppSettings>();
  const experimental = experimentalFeaturesEnabled(settings);
  const { form, onCreateProfile, onRefresh, setCreating } = params;
  const { formName, formRom, formLang, formMsu, formRandomizer, formConfigOverrides, setFormError, setFormJoining, resetForm } = form;

  return useCallback(async () => {
    if (!formName.trim() || !formRom) return;
    const invalid = randomizerFormError(formRandomizer, experimental);
    if (invalid !== undefined) {
      setFormError(invalid);
      return;
    }
    setFormError(null);
    const opts = {
      name: formName.trim(),
      romFile: formRom,
      language: formLang || undefined,
      msuPack: formMsu || undefined,
      randomizer: buildRandomizerConfig(formRandomizer, experimental),
      initialConfig: experimental
        ? { ...formConfigOverrides, developerToolsEnabled: true, experimentalFeaturesEnabled: true }
        : formConfigOverrides,
    };
    const result = opts.randomizer?.mode === 'archipelia'
      ? await createArchipeliaProfile(opts, formRandomizer.lobbyCheck, onCreateProfile, setFormJoining)
      : await onCreateProfile(opts);
    setFormJoining(null);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setCreating(false);
    resetForm();
    onRefresh();
  }, [
    formName, formRom, formLang, formMsu, formRandomizer, formConfigOverrides,
    setFormError, setFormJoining, resetForm, setCreating, onCreateProfile, onRefresh, experimental,
  ]);
};

export { useCreateProfile };
