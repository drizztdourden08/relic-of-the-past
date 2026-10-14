/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import type { GameSettings } from '@rotp/features';
import {
  freshRandomizerForm, randomizerFormError, type RandomizerFormState,
} from './build-randomizer-config';
import { applyProfilePreset, type ProfilePresetId } from './profile-presets';

const useProfileForm = () => {
  const [formName, setFormName] = useState('');
  const [formRom, setFormRom] = useState('');
  const [formLang, setFormLang] = useState('');
  const [formMsu, setFormMsu] = useState('');
  const [formRandomizer, setFormRandomizer] = useState<RandomizerFormState>(freshRandomizerForm);
  const [formPreset, setFormPreset] = useState<ProfilePresetId>('enhanced');
  const [formConfigOverrides, setFormConfigOverrides] = useState<Partial<GameSettings>>(applyProfilePreset('enhanced'));
  const [formError, setFormError] = useState<string | null>(null);

  const handlePickPreset = useCallback((id: ProfilePresetId) => {
    setFormPreset(id);
    setFormConfigOverrides(applyProfilePreset(id));
  }, []);

  const resetForm = useCallback(() => {
    setFormName('');
    setFormRom('');
    setFormLang('');
    setFormMsu('');
    setFormRandomizer(freshRandomizerForm());
    setFormPreset('enhanced');
    setFormConfigOverrides(applyProfilePreset('enhanced'));
  }, []);

  return {
    formName, setFormName,
    formRom, setFormRom,
    formLang, setFormLang,
    formMsu, setFormMsu,
    formRandomizer, setFormRandomizer,
    formPreset,
    formConfigOverrides,
    formError, setFormError,
    formInvalid: randomizerFormError(formRandomizer) !== undefined,
    handlePickPreset,
    resetForm,
  };
};

export { useProfileForm };
