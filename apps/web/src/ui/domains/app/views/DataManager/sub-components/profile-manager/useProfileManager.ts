/* @layer renderer-components @kind hook */

import { useState, useEffect, useCallback } from 'react';
import type { CreateProfileOptions, CreateProfileResult } from '@shared/types/profile';
import type { GameSettings } from '@shared/types/settings';
import { readConfig } from '../../../../../../../lib/storage/profile-store';
import { listLanguages } from '../../../../../../../lib/storage/languages-store';
import { listMsuPacks } from '../../../../../../../lib/storage/msu-store';
import { buildRandomizerConfig, EMPTY_RANDOMIZER_FORM, type RandomizerFormState } from './build-randomizer-config';
import { applyProfilePreset, type ProfilePresetId } from './profile-presets';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onCreateProfile: (opts: CreateProfileOptions) => Promise<CreateProfileResult>;
  onRefresh: () => void;
}

const useProfileManager = ({ profiles, romStatuses, onCreateProfile, onRefresh }: UseProfileManagerParams) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRom, setFormRom] = useState('');
  const [formLang, setFormLang] = useState('');
  const [formMsu, setFormMsu] = useState('');
  const [formRandomizer, setFormRandomizer] = useState<RandomizerFormState>(EMPTY_RANDOMIZER_FORM);
  const [formPreset, setFormPreset] = useState<ProfilePresetId>('enhanced');
  const [formConfigOverrides, setFormConfigOverrides] = useState<Partial<GameSettings>>(applyProfilePreset('enhanced'));
  const [formError, setFormError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Array<{ code: string }>>([]);
  const [msuPacks, setMsuPacks] = useState<Array<{ name: string }>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  const readyRoms = romStatuses.filter((r) => r.hasAssets || r.extractionStatus === 'ready');
  const selectedProfile = profiles.find((p) => p.id === selected);

  useEffect(() => {
    listLanguages().then(setLanguages);
    listMsuPacks().then(setMsuPacks);
  }, [creating]);

  useEffect(() => {
    if (!selected) { setSettings(null); return; }
    readConfig(selected).then(setSettings);
  }, [selected]);

  const handleCreate = useCallback(async () => {
    if (!formName.trim() || !formRom) return;
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
    setFormName('');
    setFormRom('');
    setFormLang('');
    setFormMsu('');
    setFormRandomizer(EMPTY_RANDOMIZER_FORM);
    setFormPreset('enhanced');
    setFormConfigOverrides(applyProfilePreset('enhanced'));
    onRefresh();
  }, [formName, formRom, formLang, formMsu, formRandomizer, formConfigOverrides, onCreateProfile, onRefresh]);

  const handlePickPreset = useCallback((id: ProfilePresetId) => {
    setFormPreset(id);
    setFormConfigOverrides(applyProfilePreset(id));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleCreate();
    if (e.key === 'Escape') setCreating(false);
  };

  return {
    selected, setSelected,
    creating, setCreating,
    formName, setFormName,
    formRom, setFormRom,
    formLang, setFormLang,
    formMsu, setFormMsu,
    formRandomizer, setFormRandomizer,
    formPreset,
    formError, setFormError,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
    handleCreate,
    handleKeyDown,
    handlePickPreset,
  };
};

export { useProfileManager };
