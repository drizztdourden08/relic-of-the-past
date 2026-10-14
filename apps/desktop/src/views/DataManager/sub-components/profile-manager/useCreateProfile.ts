/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { buildRandomizerConfig, randomizerFormError } from './build-randomizer-config';
import type { UseCreateProfileParams } from './profile-manager.type';

const useCreateProfile = (params: UseCreateProfileParams) => {
  const { form, onCreateProfile, onRefresh, setCreating } = params;
  const { formName, formRom, formLang, formMsu, formRandomizer, formConfigOverrides, setFormError, resetForm } = form;

  return useCallback(async () => {
    if (!formName.trim() || !formRom) return;
    const invalid = randomizerFormError(formRandomizer);
    if (invalid !== undefined) {
      setFormError(invalid);
      return;
    }
    setFormError(null);
    const result = await onCreateProfile({
      name: formName.trim(),
      romFile: formRom,
      language: formLang || undefined,
      msuPack: formMsu || undefined,
      randomizer: buildRandomizerConfig(formRandomizer),
      initialConfig: formConfigOverrides,
    });
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    setCreating(false);
    resetForm();
    onRefresh();
  }, [
    formName, formRom, formLang, formMsu, formRandomizer, formConfigOverrides,
    setFormError, resetForm, setCreating, onCreateProfile, onRefresh,
  ]);
};

export { useCreateProfile };
