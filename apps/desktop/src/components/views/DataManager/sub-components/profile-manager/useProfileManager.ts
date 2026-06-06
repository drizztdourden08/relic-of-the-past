/**
 * State and logic hook for ProfileManager.
 */

import { useState, useEffect, useCallback } from 'react';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onCreateProfile: (name: string, romFile: string, language?: string, msuPack?: string) => void;
  onRefresh: () => void;
}

const useProfileManager = ({ profiles, romStatuses, onCreateProfile, onRefresh }: UseProfileManagerParams) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRom, setFormRom] = useState('');
  const [formLang, setFormLang] = useState('');
  const [formMsu, setFormMsu] = useState('');
  const [languages, setLanguages] = useState<Array<{ code: string }>>([]);
  const [msuPacks, setMsuPacks] = useState<Array<{ name: string }>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  const readyRoms = romStatuses.filter((r) => r.hasAssets || r.extractionStatus === 'ready');
  const selectedProfile = profiles.find((p) => p.id === selected);

  useEffect(() => {
    window.api.listLanguages().then(setLanguages);
    window.api.listMsuPacks().then(setMsuPacks);
  }, [creating]);

  useEffect(() => {
    if (!selected) { setSettings(null); return; }
    window.api.readConfig(selected).then(setSettings);
  }, [selected]);

  const handleCreate = useCallback(() => {
    if (!formName.trim() || !formRom) return;
    onCreateProfile(formName.trim(), formRom, formLang || undefined, formMsu || undefined);
    setCreating(false);
    setFormName('');
    setFormRom('');
    setFormLang('');
    setFormMsu('');
    onRefresh();
  }, [formName, formRom, formLang, formMsu, onCreateProfile, onRefresh]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') setCreating(false);
  };

  return {
    selected, setSelected,
    creating, setCreating,
    formName, setFormName,
    formRom, setFormRom,
    formLang, setFormLang,
    formMsu, setFormMsu,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
    handleCreate,
    handleKeyDown,
  };
};

export { useProfileManager };
