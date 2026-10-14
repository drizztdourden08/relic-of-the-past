/* @layer renderer-components @kind hook */
import { useState, useEffect } from 'react';
import { readConfig } from '../../../../storage/profile-store';
import { listLanguages } from '../../../../storage/languages-store';
import { listMsuPacks } from '../../../../storage/msu-store';

const useProfileLists = (creating: boolean, selected: string | null) => {
  const [languages, setLanguages] = useState<Array<{ code: string }>>([]);
  const [msuPacks, setMsuPacks] = useState<Array<{ name: string }>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void listLanguages().then(setLanguages);
    void listMsuPacks().then(setMsuPacks);
  }, [creating]);

  useEffect(() => {
    if (!selected) { setSettings(null); return; }
    void readConfig(selected).then(setSettings);
  }, [selected]);

  return { languages, msuPacks, settings };
};

export { useProfileLists };
